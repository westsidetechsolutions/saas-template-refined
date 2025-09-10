#!/usr/bin/env tsx

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

class WorkingTestRunner {
  private results: TestSuiteResult[] = []

  async runTestSuite(name: string, scriptPath: string): Promise<TestSuiteResult> {
    console.log(`🚀 Starting ${name}...`)
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

  async runWorkingTests() {
    console.log('🧪 Working Entitlements Test Runner')
    console.log('===================================')
    console.log('This runs the tests that are currently working.')
    console.log('The logic tests validate the core entitlements system.\n')

    const testSuites = [
      {
        name: 'Entitlements Logic Tests',
        script: 'scripts/test-entitlements-logic.ts',
      },
    ]

    for (const suite of testSuites) {
      const result = await this.runTestSuite(suite.name, suite.script)
      this.results.push(result)

      // Add a small delay between test suites
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    this.printSummary()
  }

  printSummary() {
    console.log('\n📊 Working Test Runner Summary')
    console.log('==============================')

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
      console.log('\n💡 To run database-dependent tests, ensure:')
      console.log('   1. MongoDB is running')
      console.log('   2. PAYLOAD_SECRET is set in environment')
      console.log('   3. DATABASE_URI is configured')
    } else {
      console.log('\n🎉 All working tests passed!')
      console.log('\n💡 The entitlements system logic is working correctly.')
      console.log('   To test with database integration, run: npm run test-entitlements-all')
    }
  }
}

async function runWorkingTests() {
  const runner = new WorkingTestRunner()

  try {
    await runner.runWorkingTests()
  } catch (error) {
    console.error('❌ Test runner failed:', error)
    process.exit(1)
  }
}

runWorkingTests()
