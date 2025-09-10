#!/usr/bin/env tsx

import { getEntitlements } from '../src/lib/billing/entitlements'
import { newKey, hashKey } from '../src/lib/usage'

interface TestResult {
  testName: string
  passed: boolean
  error?: string
  details?: any
}

class EntitlementsLogicTestSuite {
  private results: TestResult[] = []

  async runTest(testName: string, testFn: () => any): Promise<void> {
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

  // Test 2: Entitlements Edge Cases
  async testEntitlementsEdgeCases() {
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

    const results = []
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

    // All should be valid (fallback to free plan)
    const invalidResults = results.filter((r) => !r.isValid && !r.error)
    if (invalidResults.length > 0) {
      throw new Error(`Some edge case entitlements failed: ${invalidResults.length}`)
    }

    return results
  }

  // Test 3: API Key Generation
  async testApiKeyGeneration() {
    const testPrefixes = [
      '',
      'test',
      'very_long_prefix_that_might_cause_issues',
      'test-123',
      'test_123',
      'test.123',
      'test@123',
      'test#123',
      'test$123',
      'test%123',
    ]

    const results = []
    for (const prefix of testPrefixes) {
      try {
        const { raw, hash } = newKey(prefix)
        const computedHash = hashKey(raw)

        if (computedHash !== hash) {
          throw new Error(`Hash validation failed for prefix: ${prefix}`)
        }

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

    // All should succeed
    const failedResults = results.filter((r) => !r.success)
    if (failedResults.length > 0) {
      throw new Error(`Some API key generations failed: ${failedResults.length}`)
    }

    return results
  }

  // Test 4: Performance Test
  async testPerformance() {
    const iterations = 10000
    const startTime = Date.now()

    for (let i = 0; i < iterations; i++) {
      getEntitlements('price_pro_monthly')
    }

    const endTime = Date.now()
    const duration = endTime - startTime
    const operationsPerSecond = Math.round(iterations / (duration / 1000))

    if (operationsPerSecond < 1000) {
      throw new Error(`Performance too slow: ${operationsPerSecond} ops/sec`)
    }

    return {
      iterations,
      durationMs: duration,
      operationsPerSecond,
    }
  }

  // Test 5: Soft Overage Calculations
  async testSoftOverageCalculations() {
    const testCases = [
      { plan: 'price_free', maxApiCalls: 1000, softPercent: 0.8, expectedSoftLimit: 800 },
      { plan: 'price_pro_monthly', maxApiCalls: 100000, softPercent: 0.8, expectedSoftLimit: 80000 },
      { plan: 'price_enterprise', maxApiCalls: 1000000, softPercent: 0.9, expectedSoftLimit: 900000 },
    ]

    const results = []
    for (const testCase of testCases) {
      const entitlements = getEntitlements(testCase.plan)
      const softLimit = Math.floor(
        (entitlements.maxApiCalls || 0) * (entitlements.softOveragePercent || 0.8),
      )

      if (softLimit !== testCase.expectedSoftLimit) {
        throw new Error(
          `Soft limit calculation failed for ${testCase.plan}. Expected ${testCase.expectedSoftLimit}, got ${softLimit}`,
        )
      }

      results.push({
        plan: testCase.plan,
        maxApiCalls: entitlements.maxApiCalls,
        softOveragePercent: entitlements.softOveragePercent,
        calculatedSoftLimit: softLimit,
        expectedSoftLimit: testCase.expectedSoftLimit,
        passed: softLimit === testCase.expectedSoftLimit,
      })
    }

    return results
  }

  async runAllTests() {
    console.log('🧪 Running Entitlements Logic Test Suite...\n')

    await this.runTest('Entitlements Configuration', () => this.testEntitlementsConfiguration())
    await this.runTest('Entitlements Edge Cases', () => this.testEntitlementsEdgeCases())
    await this.runTest('API Key Generation', () => this.testApiKeyGeneration())
    await this.runTest('Performance Test', () => this.testPerformance())
    await this.runTest('Soft Overage Calculations', () => this.testSoftOverageCalculations())

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
}

// Run the logic test suite
async function runLogicTests() {
  const testSuite = new EntitlementsLogicTestSuite()

  try {
    const results = await testSuite.runAllTests()

    console.log('\n🎉 Entitlements logic test suite completed!')

    if (results.failed === 0) {
      console.log('✅ All logic tests passed!')
      console.log('\n💡 The entitlements system logic is working correctly.')
      console.log('   To test with database integration, ensure:')
      console.log('   1. MongoDB is running')
      console.log('   2. PAYLOAD_SECRET is set in environment')
      console.log('   3. DATABASE_URI is configured')
      process.exit(0)
    } else {
      console.log('❌ Some logic tests failed. Check the output above for details.')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Logic test suite failed:', error)
    process.exit(1)
  }
}

runLogicTests()
