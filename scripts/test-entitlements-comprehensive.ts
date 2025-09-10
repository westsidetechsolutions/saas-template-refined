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

interface TestUser {
  id: string
  email: string
  planPriceId?: string
  subscriptionStatus?: string
  subscriptionCurrentPeriodEnd?: string
}

interface TestResult {
  testName: string
  passed: boolean
  error?: string
  details?: any
}

class EntitlementsTestSuite {
  private payload: any
  private testUsers: TestUser[] = []
  private testApiKeys: string[] = []
  private results: TestResult[] = []

  constructor() {
    this.payload = null
  }

  async initialize() {
    console.log('🚀 Initializing Entitlements Test Suite...\n')
    this.payload = await getPayload({ config })
  }

  async createSeedData() {
    console.log('📦 Creating Seed Data...\n')

    // Create test users with different plans and statuses
    const testUserData = [
      {
        email: 'test-free@example.com',
        planPriceId: 'price_free',
        subscriptionStatus: 'active',
        subscriptionCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
      {
        email: 'test-pro@example.com',
        planPriceId: 'price_pro_monthly',
        subscriptionStatus: 'active',
        subscriptionCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
      {
        email: 'test-enterprise@example.com',
        planPriceId: 'price_enterprise',
        subscriptionStatus: 'active',
        subscriptionCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
      {
        email: 'test-past-due@example.com',
        planPriceId: 'price_pro_monthly',
        subscriptionStatus: 'past_due',
        subscriptionCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
      {
        email: 'test-canceled@example.com',
        planPriceId: 'price_pro_monthly',
        subscriptionStatus: 'canceled',
        subscriptionCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
      {
        email: 'test-no-plan@example.com',
        planPriceId: undefined,
        subscriptionStatus: undefined,
        subscriptionCurrentPeriodEnd: undefined,
      },
      {
        email: 'test-trialing@example.com',
        planPriceId: 'price_pro_monthly',
        subscriptionStatus: 'trialing',
        subscriptionCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
      {
        email: 'test-incomplete@example.com',
        planPriceId: 'price_pro_monthly',
        subscriptionStatus: 'incomplete',
        subscriptionCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    ]

    for (const userData of testUserData) {
      try {
        const user = await this.payload.create({
          collection: 'users',
          data: {
            email: userData.email,
            firstName: 'Test',
            lastName: 'User',
            password: 'testpassword123',
            role: 'user',
            planPriceId: userData.planPriceId,
            subscriptionStatus: userData.subscriptionStatus,
            subscriptionCurrentPeriodEnd: userData.subscriptionCurrentPeriodEnd,
          },
        })
        this.testUsers.push({
          id: user.id,
          email: user.email,
          planPriceId: user.planPriceId,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
        })
        console.log(`   ✅ Created test user: ${user.email}`)
      } catch (error) {
        console.log(`   ❌ Failed to create user ${userData.email}:`, error.message)
      }
    }

    console.log(`\n📊 Created ${this.testUsers.length} test users\n`)
  }

  async runTest(testName: string, testFn: () => Promise<any>): Promise<void> {
    try {
      console.log(`🧪 Running: ${testName}`)
      const result = await testFn()
      this.results.push({ testName, passed: true, details: result })
      console.log(`   ✅ PASSED: ${testName}`)
    } catch (error) {
      this.results.push({ testName, passed: false, error: error.message })
      console.log(`   ❌ FAILED: ${testName} - ${error.message}`)
    }
  }

  // Test 1: Entitlements Configuration
  async testEntitlementsConfiguration() {
    const freeEntitlements = getEntitlements('price_free')
    const proEntitlements = getEntitlements('price_pro_monthly')
    const enterpriseEntitlements = getEntitlements('price_enterprise')
    const unknownEntitlements = getEntitlements('unknown_plan')

    const assertions = [
      freeEntitlements.maxItems === 100,
      freeEntitlements.maxApiCalls === 1000,
      freeEntitlements.maxStorageMb === 100,
      proEntitlements.maxItems === 5000,
      proEntitlements.maxApiCalls === 100000,
      enterpriseEntitlements.maxItems === 50000,
      enterpriseEntitlements.maxApiCalls === 1000000,
      unknownEntitlements.maxItems === 100, // Should fallback to free
    ]

    const failedAssertions = assertions.filter((assertion) => !assertion)
    if (failedAssertions.length > 0) {
      throw new Error(
        `Entitlements configuration test failed: ${failedAssertions.length} assertions failed`,
      )
    }

    return { freeEntitlements, proEntitlements, enterpriseEntitlements, unknownEntitlements }
  }

  // Test 2: Billing Window Calculation
  async testBillingWindowCalculation() {
    const results = []

    for (const user of this.testUsers) {
      const { periodStart, periodEnd } = getBillingWindow(user)

      // Validate billing window
      const isValidStart = periodStart instanceof Date && !isNaN(periodStart.getTime())
      const isValidEnd = periodEnd instanceof Date && !isNaN(periodEnd.getTime())
      const isPositiveDuration = periodEnd.getTime() > periodStart.getTime()

      if (!isValidStart || !isValidEnd || !isPositiveDuration) {
        throw new Error(`Invalid billing window for user ${user.email}`)
      }

      results.push({
        user: user.email,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        durationDays: Math.ceil(
          (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24),
        ),
      })
    }

    return results
  }

  // Test 3: Usage Document Creation
  async testUsageDocumentCreation() {
    const results = []

    for (const user of this.testUsers) {
      const { periodStart, periodEnd } = getBillingWindow(user)
      const usage = await getOrCreateCurrentUsage(user.id, periodStart, periodEnd)

      // Validate usage document
      const isValidUsage =
        usage &&
        usage.user === user.id &&
        usage.apiCalls === 0 &&
        usage.itemsCreated === 0 &&
        usage.storageMb === 0

      if (!isValidUsage) {
        throw new Error(`Invalid usage document for user ${user.email}`)
      }

      results.push({
        user: user.email,
        usageId: usage.id,
        apiCalls: usage.apiCalls,
        itemsCreated: usage.itemsCreated,
        storageMb: usage.storageMb,
      })
    }

    return results
  }

  // Test 4: Usage Increment
  async testUsageIncrement() {
    const results = []

    for (const user of this.testUsers) {
      const initialUsage = await incUsage(user.id, 'apiCalls', 5)
      const updatedUsage = await incUsage(user.id, 'apiCalls', 3)

      if (updatedUsage.apiCalls !== 8) {
        throw new Error(
          `Usage increment failed for user ${user.email}. Expected 8, got ${updatedUsage.apiCalls}`,
        )
      }

      results.push({
        user: user.email,
        initialApiCalls: initialUsage.apiCalls,
        finalApiCalls: updatedUsage.apiCalls,
        increment: 8,
      })
    }

    return results
  }

  // Test 5: Limit Enforcement - Within Limits
  async testLimitEnforcementWithinLimits() {
    const results = []

    for (const user of this.testUsers) {
      const { periodStart, periodEnd } = getBillingWindow(user)
      const usage = await getOrCreateCurrentUsage(user.id, periodStart, periodEnd)

      // Reset usage to 0 for clean test
      await this.payload.update({
        collection: 'usage',
        id: usage.id,
        data: { apiCalls: 0, itemsCreated: 0, storageMb: 0 },
      })

      const check = await enforceLimit({ user, usageDoc: { apiCalls: 0 }, field: 'apiCalls' })

      if (!check.ok) {
        throw new Error(`Limit enforcement failed for user ${user.email}. Should be within limits.`)
      }

      results.push({
        user: user.email,
        plan: user.planPriceId || 'free',
        limit: check.limit,
        remaining: check.remaining,
        ok: check.ok,
      })
    }

    return results
  }

  // Test 6: Limit Enforcement - At Limits
  async testLimitEnforcementAtLimits() {
    const results = []

    for (const user of this.testUsers) {
      const entitlements = getEntitlements(user.planPriceId)
      const { periodStart, periodEnd } = getBillingWindow(user)
      const usage = await getOrCreateCurrentUsage(user.id, periodStart, periodEnd)

      // Set usage to exactly at the limit
      const atLimitUsage = { apiCalls: entitlements.maxApiCalls || 0 }
      const check = await enforceLimit({ user, usageDoc: atLimitUsage, field: 'apiCalls' })

      if (check.ok) {
        throw new Error(`Limit enforcement failed for user ${user.email}. Should be at limit.`)
      }

      results.push({
        user: user.email,
        plan: user.planPriceId || 'free',
        limit: check.limit,
        current: atLimitUsage.apiCalls,
        ok: check.ok,
      })
    }

    return results
  }

  // Test 7: Limit Enforcement - Over Limits
  async testLimitEnforcementOverLimits() {
    const results = []

    for (const user of this.testUsers) {
      const entitlements = getEntitlements(user.planPriceId)
      const { periodStart, periodEnd } = getBillingWindow(user)
      const usage = await getOrCreateCurrentUsage(user.id, periodStart, periodEnd)

      // Set usage over the limit
      const overLimitUsage = { apiCalls: (entitlements.maxApiCalls || 0) + 10 }
      const check = await enforceLimit({ user, usageDoc: overLimitUsage, field: 'apiCalls' })

      if (check.ok) {
        throw new Error(`Limit enforcement failed for user ${user.email}. Should be over limit.`)
      }

      results.push({
        user: user.email,
        plan: user.planPriceId || 'free',
        limit: check.limit,
        current: overLimitUsage.apiCalls,
        ok: check.ok,
      })
    }

    return results
  }

  // Test 8: API Key Generation and Validation
  async testApiKeyGeneration() {
    const results = []

    for (const user of this.testUsers) {
      const { raw, hash } = newKey('test')

      // Validate hash
      const computedHash = hashKey(raw)
      if (computedHash !== hash) {
        throw new Error(`Hash validation failed for user ${user.email}`)
      }

      // Create API key in database
      const apiKey = await this.payload.create({
        collection: 'api_keys',
        data: {
          user: user.id,
          name: `Test Key for ${user.email}`,
          keyHash: hash,
          scopes: ['read', 'write'],
        },
      })

      this.testApiKeys.push(apiKey.id)

      results.push({
        user: user.email,
        keyId: apiKey.id,
        keyPrefix: raw.substring(0, 10) + '...',
        hashValid: computedHash === hash,
      })
    }

    return results
  }

  // Test 9: Soft Overage Warnings
  async testSoftOverageWarnings() {
    const results = []

    for (const user of this.testUsers) {
      const entitlements = getEntitlements(user.planPriceId)
      const softLimit = Math.floor(
        (entitlements.maxApiCalls || 0) * (entitlements.softOveragePercent || 0.8),
      )

      // Test at soft limit
      const atSoftLimitUsage = { apiCalls: softLimit }
      const check = await enforceLimit({ user, usageDoc: atSoftLimitUsage, field: 'apiCalls' })

      results.push({
        user: user.email,
        plan: user.planPriceId || 'free',
        maxApiCalls: entitlements.maxApiCalls,
        softLimit,
        softOveragePercent: entitlements.softOveragePercent,
        atSoftLimit: check.ok,
        remaining: check.remaining,
      })
    }

    return results
  }

  // Test 10: Different Usage Types
  async testDifferentUsageTypes() {
    const results = []

    for (const user of this.testUsers) {
      const usageTypes = ['apiCalls', 'itemsCreated', 'storageMb'] as const
      const userResults = {}

      for (const usageType of usageTypes) {
        const { periodStart, periodEnd } = getBillingWindow(user)
        const usage = await getOrCreateCurrentUsage(user.id, periodStart, periodEnd)

        // Test increment
        const updatedUsage = await incUsage(user.id, usageType, 10)

        // Test limit enforcement
        const check = await enforceLimit({ user, usageDoc: updatedUsage, field: usageType })

        userResults[usageType] = {
          current: updatedUsage[usageType],
          limit: check.limit,
          remaining: check.remaining,
          ok: check.ok,
        }
      }

      results.push({
        user: user.email,
        usage: userResults,
      })
    }

    return results
  }

  // Test 11: Subscription Status Impact
  async testSubscriptionStatusImpact() {
    const results = []

    for (const user of this.testUsers) {
      const { periodStart, periodEnd } = getBillingWindow(user)
      const usage = await getOrCreateCurrentUsage(user.id, periodStart, periodEnd)

      // Test usage increment regardless of status
      const updatedUsage = await incUsage(user.id, 'apiCalls', 1)

      results.push({
        user: user.email,
        status: user.subscriptionStatus || 'none',
        plan: user.planPriceId || 'free',
        apiCalls: updatedUsage.apiCalls,
        canIncrement: updatedUsage.apiCalls > 0,
      })
    }

    return results
  }

  // Test 12: Edge Cases
  async testEdgeCases() {
    const results = []

    // Test with null/undefined values
    const nullUser = {
      id: 'test-null',
      planPriceId: undefined,
      subscriptionStatus: undefined,
      subscriptionCurrentPeriodEnd: undefined,
    }

    const nullEntitlements = getEntitlements(nullUser.planPriceId)
    const nullBillingWindow = getBillingWindow(nullUser)

    results.push({
      test: 'null_user_entitlements',
      entitlements: nullEntitlements,
      billingWindow: {
        start: nullBillingWindow.periodStart.toISOString(),
        end: nullBillingWindow.periodEnd.toISOString(),
      },
    })

    // Test with invalid dates
    const invalidDateUser = {
      id: 'test-invalid-date',
      planPriceId: 'price_free',
      subscriptionStatus: 'active',
      subscriptionCurrentPeriodEnd: 'invalid-date',
    }

    const invalidBillingWindow = getBillingWindow(invalidDateUser)

    results.push({
      test: 'invalid_date_billing_window',
      billingWindow: {
        start: invalidBillingWindow.periodStart.toISOString(),
        end: invalidBillingWindow.periodEnd.toISOString(),
      },
    })

    return results
  }

  // Test 13: Performance Test
  async testPerformance() {
    const results = []
    const iterations = 100

    // Test entitlements lookup performance
    const startTime = Date.now()
    for (let i = 0; i < iterations; i++) {
      getEntitlements('price_pro_monthly')
    }
    const entitlementsTime = Date.now() - startTime

    // Test billing window calculation performance
    const user = this.testUsers[0]
    const billingStartTime = Date.now()
    for (let i = 0; i < iterations; i++) {
      getBillingWindow(user)
    }
    const billingTime = Date.now() - billingStartTime

    results.push({
      entitlementsLookupsPerSecond: Math.round(iterations / (entitlementsTime / 1000)),
      billingWindowCalculationsPerSecond: Math.round(iterations / (billingTime / 1000)),
      entitlementsTimeMs: entitlementsTime,
      billingTimeMs: billingTime,
    })

    return results
  }

  async runAllTests() {
    console.log('🧪 Running Comprehensive Entitlements Test Suite...\n')

    await this.runTest('Entitlements Configuration', () => this.testEntitlementsConfiguration())
    await this.runTest('Billing Window Calculation', () => this.testBillingWindowCalculation())
    await this.runTest('Usage Document Creation', () => this.testUsageDocumentCreation())
    await this.runTest('Usage Increment', () => this.testUsageIncrement())
    await this.runTest('Limit Enforcement - Within Limits', () =>
      this.testLimitEnforcementWithinLimits(),
    )
    await this.runTest('Limit Enforcement - At Limits', () => this.testLimitEnforcementAtLimits())
    await this.runTest('Limit Enforcement - Over Limits', () =>
      this.testLimitEnforcementOverLimits(),
    )
    await this.runTest('API Key Generation', () => this.testApiKeyGeneration())
    await this.runTest('Soft Overage Warnings', () => this.testSoftOverageWarnings())
    await this.runTest('Different Usage Types', () => this.testDifferentUsageTypes())
    await this.runTest('Subscription Status Impact', () => this.testSubscriptionStatusImpact())
    await this.runTest('Edge Cases', () => this.testEdgeCases())
    await this.runTest('Performance Test', () => this.testPerformance())

    console.log('\n📊 Test Results Summary:')
    console.log('========================')

    const passed = this.results.filter((r) => r.passed).length
    const failed = this.results.filter((r) => !r.passed).length
    const total = this.results.length

    console.log(`Total Tests: ${total}`)
    console.log(`Passed: ${passed}`)
    console.log(`Failed: ${failed}`)
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results
        .filter((r) => !r.passed)
        .forEach((result) => {
          console.log(`   - ${result.testName}: ${result.error}`)
        })
    }

    return { passed, failed, total, results: this.results }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test data...')

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

        console.log(`   ✅ Cleaned up user: ${user.email}`)
      } catch (error) {
        console.log(`   Warning: Could not clean up user ${user.email}: ${error.message}`)
      }
    }

    console.log('   ✅ Cleanup completed')
  }
}

// Run the comprehensive test suite
async function runComprehensiveTests() {
  const testSuite = new EntitlementsTestSuite()

  try {
    await testSuite.initialize()
    await testSuite.createSeedData()
    const results = await testSuite.runAllTests()
    await testSuite.cleanup()

    console.log('\n🎉 Comprehensive test suite completed!')

    if (results.failed === 0) {
      console.log('✅ All tests passed!')
      process.exit(0)
    } else {
      console.log('❌ Some tests failed. Check the output above for details.')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Test suite failed:', error)
    await testSuite.cleanup()
    process.exit(1)
  }
}

runComprehensiveTests()
