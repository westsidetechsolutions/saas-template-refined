#!/usr/bin/env tsx

import { config as dotenvConfig } from 'dotenv'
import path from 'path'

// Load environment variables from test.env
dotenvConfig({ path: path.resolve(process.cwd(), 'test.env') })

import { spawn } from 'child_process'
import { promisify } from 'util'
import { exec } from 'child_process'

const execAsync = promisify(exec)

interface TestSuiteResult {
  name: string
  passed: boolean
  duration: number
  output: string
  error?: string
}

class MasterTestRunner {
  private results: TestSuiteResult[] = []

  async runTestSuite(name: string, scriptPath: string): Promise<TestSuiteResult> {
    console.log(`\n🚀 Starting ${name}...`)
    console.log('='.repeat(50))

    const startTime = Date.now()

    try {
      const { stdout, stderr } = await execAsync(`tsx ${scriptPath}`, {
        timeout: 300000, // 5 minutes timeout
        env: { ...process.env, NODE_OPTIONS: '--no-deprecation' },
      })

      const duration = Date.now() - startTime
      const output = stdout + stderr

      // Check if the test suite passed by looking for success indicators
      const passed =
        output.includes('✅ All tests passed') ||
        output.includes('✅ All logic tests passed') ||
        output.includes('🎉 Comprehensive test suite completed') ||
        output.includes('🎉 Edge case test suite completed') ||
        output.includes('🎉 Entitlements logic test suite completed')

      const result: TestSuiteResult = {
        name,
        passed,
        duration,
        output,
      }

      if (!passed && stderr) {
        result.error = stderr
      }

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      const output = error.stdout || ''
      const errorOutput = error.stderr || error.message || ''

      return {
        name,
        passed: false,
        duration,
        output: output + errorOutput,
        error: errorOutput,
      }
    }
  }

  async runAllTestSuites() {
    console.log('🧪 Master Entitlements Test Runner')
    console.log('==================================')
    console.log('This will run comprehensive and edge case tests for the entitlements system.')
    console.log('Each test suite creates its own seed data and cleans up afterward.\n')

    // Check environment first
    console.log('🔍 Checking environment setup...')
    try {
      await this.runTestSuite('Environment Check', 'scripts/test-environment-setup.ts')
    } catch (error) {
      console.log('❌ Environment check failed. Please run: npm run test-environment')
      process.exit(1)
    }

    const testSuites = [
      {
        name: 'Entitlements Logic Tests',
        script: 'scripts/test-entitlements-logic.ts',
      },
      {
        name: 'Comprehensive Test Suite',
        script: 'scripts/test-entitlements-comprehensive.ts',
      },
      {
        name: 'Edge Case Test Suite',
        script: 'scripts/test-entitlements-edge-cases.ts',
      },
    ]

    for (const suite of testSuites) {
      const result = await this.runTestSuite(suite.name, suite.script)
      this.results.push(result)

      // Add a small delay between test suites
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    this.printSummary()
  }

  printSummary() {
    console.log('\n📊 Master Test Runner Summary')
    console.log('=============================')

    const totalSuites = this.results.length
    const passedSuites = this.results.filter((r) => r.passed).length
    const failedSuites = this.results.filter((r) => !r.passed).length
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)

    console.log(`Total Test Suites: ${totalSuites}`)
    console.log(`Passed: ${passedSuites}`)
    console.log(`Failed: ${failedSuites}`)
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(1)}s`)
    console.log(`Success Rate: ${((passedSuites / totalSuites) * 100).toFixed(1)}%`)

    console.log('\n📋 Detailed Results:')
    console.log('==================')

    for (const result of this.results) {
      const status = result.passed ? '✅ PASSED' : '❌ FAILED'
      const duration = (result.duration / 1000).toFixed(1)

      console.log(`${status} ${result.name} (${duration}s)`)

      if (!result.passed && result.error) {
        console.log(`   Error: ${result.error.substring(0, 200)}...`)
      }
    }

    if (failedSuites > 0) {
      console.log('\n❌ Some test suites failed. Check the output above for details.')
      console.log('\n🔍 To run individual test suites:')
      console.log('   npm run test-entitlements-comprehensive')
      console.log('   npm run test-entitlements-edge-cases')
      process.exit(1)
    } else {
      console.log('\n🎉 All test suites passed!')
      console.log('\n✅ The entitlements system is working correctly.')
      process.exit(0)
    }
  }
}

// Run the master test runner
async function runMasterTests() {
  const runner = new MasterTestRunner()

  try {
    await runner.runAllTestSuites()
  } catch (error) {
    console.error('❌ Master test runner failed:', error)
    process.exit(1)
  }
}

runMasterTests()
