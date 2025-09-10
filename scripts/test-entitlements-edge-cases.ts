#!/usr/bin/env tsx

// Set required environment variables for testing
process.env.PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'test-secret-key-for-testing-only'
process.env.DATABASE_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017/saastemplate-test'

import { getPayload } from 'payload'
import config from '../src/payload.config'
import {
  getBillingWindow,
  getOrCreateCurrentUsage,
  incUsage,
  enforceLimit,
  newKey,
  hashKey,
} from '../src/lib/usage'
import { getEntitlements } from '../src/lib/billing/entitlements'

interface StressTestResult {
  testName: string
  iterations: number
  successCount: number
  failureCount: number
  averageTimeMs: number
  errors: string[]
}

class EdgeCaseTestSuite {
  private payload: any
  private testUsers: any[] = []
  private testApiKeys: string[] = []

  constructor() {
    this.payload = null
  }

  async initialize() {
    console.log('🚀 Initializing Edge Case Test Suite...\n')
    this.payload = await getPayload({ config })
  }

  async createEdgeCaseUsers() {
    console.log('📦 Creating Edge Case Test Users...\n')

    const edgeCaseUsers = [
      // User with very old subscription end date
      {
        email: 'edge-old-date@example.com',
        planPriceId: 'price_free',
        subscriptionStatus: 'active',
        subscriptionCurrentPeriodEnd: new Date('2020-01-01'),
      },
      // User with future subscription end date
      {
        email: 'edge-future-date@example.com',
        planPriceId: 'price_enterprise',
        subscriptionStatus: 'active',
        subscriptionCurrentPeriodEnd: new Date('2030-12-31'),
      },
      // User with exactly current date
      {
        email: 'edge-current-date@example.com',
        planPriceId: 'price_pro_monthly',
        subscriptionStatus: 'active',
        subscriptionCurrentPeriodEnd: new Date(),
      },
      // User with null values
      {
        email: 'edge-null-values@example.com',
        planPriceId: null,
        subscriptionStatus: null,
        subscriptionCurrentPeriodEnd: null,
      },
      // User with empty strings
      {
        email: 'edge-empty-strings@example.com',
        planPriceId: '',
        subscriptionStatus: '',
        subscriptionCurrentPeriodEnd: '',
      },
      // User with invalid date string
      {
        email: 'edge-invalid-date@example.com',
        planPriceId: 'price_free',
        subscriptionStatus: 'active',
        subscriptionCurrentPeriodEnd: 'not-a-date',
      },
      // User with very large numbers
      {
        email: 'edge-large-numbers@example.com',
        planPriceId: 'price_enterprise',
        subscriptionStatus: 'active',
        subscriptionCurrentPeriodEnd: new Date(Date.now() + 365 * 24 * 3600 * 1000), // 1 year from now
      },
    ]

    for (const userData of edgeCaseUsers) {
      try {
        const user = await this.payload.create({
          collection: 'users',
          data: {
            email: userData.email,
            firstName: 'Edge',
            lastName: 'Case',
            password: 'testpassword123',
            role: 'user',
            planPriceId: userData.planPriceId,
            subscriptionStatus: userData.subscriptionStatus,
            subscriptionCurrentPeriodEnd: userData.subscriptionCurrentPeriodEnd,
          },
        })
        this.testUsers.push(user)
        console.log(`   ✅ Created edge case user: ${user.email}`)
      } catch (error) {
        console.log(`   ❌ Failed to create edge case user ${userData.email}:`, error.message)
      }
    }

    console.log(`\n📊 Created ${this.testUsers.length} edge case users\n`)
  }

  async testBillingWindowEdgeCases() {
    console.log('🧪 Testing Billing Window Edge Cases...\n')
    const results = []

    for (const user of this.testUsers) {
      try {
        const { periodStart, periodEnd } = getBillingWindow(user)

        // Validate the billing window is reasonable
        const isValidStart = periodStart instanceof Date && !isNaN(periodStart.getTime())
        const isValidEnd = periodEnd instanceof Date && !isNaN(periodEnd.getTime())
        const isPositiveDuration = periodEnd.getTime() > periodStart.getTime()
        const isReasonableDuration =
          periodEnd.getTime() - periodStart.getTime() < 365 * 24 * 3600 * 1000 // Less than 1 year

        results.push({
          user: user.email,
          originalEndDate: user.subscriptionCurrentPeriodEnd,
          calculatedStart: periodStart.toISOString(),
          calculatedEnd: periodEnd.toISOString(),
          isValidStart,
          isValidEnd,
          isPositiveDuration,
          isReasonableDuration,
          durationDays: Math.ceil(
            (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24),
          ),
        })

        if (!isValidStart || !isValidEnd || !isPositiveDuration) {
          throw new Error(`Invalid billing window for user ${user.email}`)
        }
      } catch (error) {
        results.push({
          user: user.email,
          error: error.message,
          originalEndDate: user.subscriptionCurrentPeriodEnd,
        })
      }
    }

    return results
  }

  async testEntitlementsEdgeCases() {
    console.log('🧪 Testing Entitlements Edge Cases...\n')
    const results = []

    const edgeCasePlanIds = [
      null,
      undefined,
      '',
      'invalid_plan',
      'price_free',
      'price_pro_monthly',
      'price_enterprise',
      'PRICE_FREE', // Case sensitivity
      'price_free_', // Trailing underscore
      '_price_free', // Leading underscore
      'price-free', // Different separator
    ]

    for (const planId of edgeCasePlanIds) {
      try {
        const entitlements = getEntitlements(planId)
        results.push({
          planId: planId,
          entitlements,
          isValid: entitlements.maxItems !== undefined,
        })
      } catch (error) {
        results.push({
          planId: planId,
          error: error.message,
        })
      }
    }

    return results
  }

  async testUsageIncrementEdgeCases() {
    console.log('🧪 Testing Usage Increment Edge Cases...\n')
    const results = []

    for (const user of this.testUsers) {
      try {
        const { periodStart, periodEnd } = getBillingWindow(user)
        const usage = await getOrCreateCurrentUsage(user.id, periodStart, periodEnd)

        // Test various increment values
        const testIncrements = [0, 1, -1, 1000000, 0.5, -0.5, NaN, Infinity, -Infinity]

        for (const increment of testIncrements) {
          try {
            const updatedUsage = await incUsage(user.id, 'apiCalls', increment)
            results.push({
              user: user.email,
              increment,
              result: updatedUsage.apiCalls,
              success: true,
            })
          } catch (error) {
            results.push({
              user: user.email,
              increment,
              error: error.message,
              success: false,
            })
          }
        }
      } catch (error) {
        results.push({
          user: user.email,
          error: error.message,
        })
      }
    }

    return results
  }

  async testLimitEnforcementEdgeCases() {
    console.log('🧪 Testing Limit Enforcement Edge Cases...\n')
    const results = []

    for (const user of this.testUsers) {
      try {
        const entitlements = getEntitlements(user.planPriceId)
        const { periodStart, periodEnd } = getBillingWindow(user)
        const usage = await getOrCreateCurrentUsage(user.id, periodStart, periodEnd)

        // Test various usage values
        const testUsageValues = [
          0,
          entitlements.maxApiCalls - 1,
          entitlements.maxApiCalls,
          entitlements.maxApiCalls + 1,
          Infinity,
          -Infinity,
          NaN,
        ]

        for (const usageValue of testUsageValues) {
          try {
            const check = await enforceLimit({
              user,
              usageDoc: { apiCalls: usageValue },
              field: 'apiCalls',
            })

            results.push({
              user: user.email,
              usageValue,
              limit: check.limit,
              remaining: check.remaining,
              ok: check.ok,
              success: true,
            })
          } catch (error) {
            results.push({
              user: user.email,
              usageValue,
              error: error.message,
              success: false,
            })
          }
        }
      } catch (error) {
        results.push({
          user: user.email,
          error: error.message,
        })
      }
    }

    return results
  }

  async testApiKeyEdgeCases() {
    console.log('🧪 Testing API Key Edge Cases...\n')
    const results = []

    // Test various key prefixes
    const testPrefixes = [
      '',
      'a',
      'very_long_prefix_that_might_cause_issues',
      'test-123',
      'test_123',
      'test.123',
      'test@123',
      'test#123',
      'test$123',
      'test%123',
      'test^123',
      'test&123',
      'test*123',
      'test(123',
      'test)123',
      'test+123',
      'test=123',
      'test[123',
      'test]123',
      'test{123',
      'test}123',
      'test|123',
      'test\\123',
      'test/123',
      'test?123',
      'test<123',
      'test>123',
      'test,123',
      'test;123',
      'test:123',
      'test"123',
      "test'123",
      'test`123',
      'test~123',
      'test!123',
      'test@123',
    ]

    for (const prefix of testPrefixes) {
      try {
        const { raw, hash } = newKey(prefix)
        const computedHash = hashKey(raw)

        results.push({
          prefix,
          rawKeyLength: raw.length,
          hashLength: hash.length,
          hashValid: computedHash === hash,
          success: true,
        })
      } catch (error) {
        results.push({
          prefix,
          error: error.message,
          success: false,
        })
      }
    }

    return results
  }

  async stressTestUsageIncrement() {
    console.log('🧪 Stress Testing Usage Increment...\n')
    const iterations = 100
    const results: StressTestResult = {
      testName: 'Usage Increment Stress Test',
      iterations,
      successCount: 0,
      failureCount: 0,
      averageTimeMs: 0,
      errors: [],
    }

    const user = this.testUsers[0]
    if (!user) {
      throw new Error('No test user available for stress test')
    }

    const startTime = Date.now()

    for (let i = 0; i < iterations; i++) {
      const iterationStart = Date.now()

      try {
        await incUsage(user.id, 'apiCalls', 1)
        results.successCount++
      } catch (error) {
        results.failureCount++
        results.errors.push(`Iteration ${i}: ${error.message}`)
      }

      const iterationTime = Date.now() - iterationStart
      results.averageTimeMs += iterationTime
    }

    results.averageTimeMs = results.averageTimeMs / iterations
    const totalTime = Date.now() - startTime

    console.log(`   Total time: ${totalTime}ms`)
    console.log(`   Average time per iteration: ${results.averageTimeMs.toFixed(2)}ms`)
    console.log(`   Success rate: ${((results.successCount / iterations) * 100).toFixed(1)}%`)

    return results
  }

  async stressTestEntitlementsLookup() {
    console.log('🧪 Stress Testing Entitlements Lookup...\n')
    const iterations = 10000
    const results: StressTestResult = {
      testName: 'Entitlements Lookup Stress Test',
      iterations,
      successCount: 0,
      failureCount: 0,
      averageTimeMs: 0,
      errors: [],
    }

    const planIds = ['price_free', 'price_pro_monthly', 'price_enterprise', 'unknown_plan']
    const startTime = Date.now()

    for (let i = 0; i < iterations; i++) {
      const iterationStart = Date.now()
      const planId = planIds[i % planIds.length]

      try {
        getEntitlements(planId)
        results.successCount++
      } catch (error) {
        results.failureCount++
        results.errors.push(`Iteration ${i}: ${error.message}`)
      }

      const iterationTime = Date.now() - iterationStart
      results.averageTimeMs += iterationTime
    }

    results.averageTimeMs = results.averageTimeMs / iterations
    const totalTime = Date.now() - startTime

    console.log(`   Total time: ${totalTime}ms`)
    console.log(`   Average time per lookup: ${results.averageTimeMs.toFixed(2)}ms`)
    console.log(`   Lookups per second: ${Math.round(iterations / (totalTime / 1000))}`)

    return results
  }

  async testConcurrentUsageIncrements() {
    console.log('🧪 Testing Concurrent Usage Increments...\n')
    const concurrentUsers = 10
    const incrementsPerUser = 10
    const results = []

    const promises = this.testUsers.slice(0, concurrentUsers).map(async (user, index) => {
      const userResults = []

      for (let i = 0; i < incrementsPerUser; i++) {
        try {
          const startTime = Date.now()
          const updatedUsage = await incUsage(user.id, 'apiCalls', 1)
          const endTime = Date.now()

          userResults.push({
            user: user.email,
            increment: i + 1,
            finalApiCalls: updatedUsage.apiCalls,
            timeMs: endTime - startTime,
            success: true,
          })
        } catch (error) {
          userResults.push({
            user: user.email,
            increment: i + 1,
            error: error.message,
            success: false,
          })
        }
      }

      return userResults
    })

    const allResults = await Promise.all(promises)
    return allResults.flat()
  }

  async runAllEdgeCaseTests() {
    console.log('🧪 Running Edge Case Test Suite...\n')

    const results = {
      billingWindow: await this.testBillingWindowEdgeCases(),
      entitlements: await this.testEntitlementsEdgeCases(),
      usageIncrement: await this.testUsageIncrementEdgeCases(),
      limitEnforcement: await this.testLimitEnforcementEdgeCases(),
      apiKeys: await this.testApiKeyEdgeCases(),
      stressUsage: await this.stressTestUsageIncrement(),
      stressEntitlements: await this.stressTestEntitlementsLookup(),
      concurrent: await this.testConcurrentUsageIncrements(),
    }

    console.log('\n📊 Edge Case Test Results Summary:')
    console.log('==================================')

    const totalTests = Object.keys(results).length
    let passedTests = 0
    let failedTests = 0

    for (const [testName, testResult] of Object.entries(results)) {
      if (Array.isArray(testResult)) {
        const errors = testResult.filter((r) => r.error)
        if (errors.length === 0) {
          console.log(`✅ ${testName}: ${testResult.length} cases passed`)
          passedTests++
        } else {
          console.log(`❌ ${testName}: ${errors.length} errors out of ${testResult.length} cases`)
          failedTests++
        }
      } else if (testResult.successCount > 0) {
        console.log(`✅ ${testName}: ${testResult.successCount}/${testResult.iterations} passed`)
        passedTests++
      } else {
        console.log(`❌ ${testName}: Failed`)
        failedTests++
      }
    }

    console.log(`\nTotal Test Categories: ${totalTests}`)
    console.log(`Passed: ${passedTests}`)
    console.log(`Failed: ${failedTests}`)
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)

    return results
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up edge case test data...')

    // Delete test API keys
    for (const keyId of this.testApiKeys) {
      try {
        await this.payload.delete({
          collection: 'api_keys',
          id: keyId,
        })
      } catch (error) {
        console.log(`   Warning: Could not delete API key ${keyId}: ${error.message}`)
      }
    }

    // Delete test users and their usage data
    for (const user of this.testUsers) {
      try {
        // Delete usage documents first
        const usageDocs = await this.payload.find({
          collection: 'usage',
          where: { user: { equals: user.id } },
        })

        for (const usageDoc of usageDocs.docs) {
          await this.payload.delete({
            collection: 'usage',
            id: usageDoc.id,
          })
        }

        // Delete user
        await this.payload.delete({
          collection: 'users',
          id: user.id,
        })

        console.log(`   ✅ Cleaned up edge case user: ${user.email}`)
      } catch (error) {
        console.log(`   Warning: Could not clean up edge case user ${user.email}: ${error.message}`)
      }
    }

    console.log('   ✅ Edge case cleanup completed')
  }
}

// Run the edge case test suite
async function runEdgeCaseTests() {
  const testSuite = new EdgeCaseTestSuite()

  try {
    await testSuite.initialize()
    await testSuite.createEdgeCaseUsers()
    const results = await testSuite.runAllEdgeCaseTests()
    await testSuite.cleanup()

    console.log('\n🎉 Edge case test suite completed!')

    // Check if any major failures occurred
    const hasMajorFailures = Object.values(results).some((result) => {
      if (Array.isArray(result)) {
        return result.some((r) => r.error)
      }
      return result.failureCount > 0
    })

    if (!hasMajorFailures) {
      console.log('✅ All edge case tests passed!')
      process.exit(0)
    } else {
      console.log('⚠️  Some edge case tests had issues. Check the output above for details.')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Edge case test suite failed:', error)
    await testSuite.cleanup()
    process.exit(1)
  }
}

runEdgeCaseTests()
