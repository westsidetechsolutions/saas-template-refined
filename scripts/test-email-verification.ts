#!/usr/bin/env tsx

import { getPayload } from 'payload'
import config from '../src/payload.config'

async function testEmailVerification() {
  console.log('🧪 Testing Email Verification System\n')

  try {
    const payload = await getPayload({ config })

    // Test 1: Check if verification is enabled
    console.log('1. Checking verification configuration...')
    const usersCollection = payload.collections.users
    const authConfig = usersCollection.config.auth

    if (authConfig?.verify) {
      console.log('   ✅ Email verification is enabled')
    } else {
      console.log('   ❌ Email verification is NOT enabled')
      return
    }

    // Test 2: Check environment variables
    console.log('\n2. Checking environment variables...')
    const requiredEnvVars = [
      'RESEND_API_KEY',
      'EMAIL_FROM',
      'NEXT_PUBLIC_APP_URL',
      'NEXT_PUBLIC_PAYLOAD_URL',
    ]

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    if (missingVars.length === 0) {
      console.log('   ✅ All required environment variables are set')
    } else {
      console.log('   ❌ Missing environment variables:', missingVars.join(', '))
      console.log('   Please set these in your .env.local file')
      return
    }

    // Test 3: Check if verification email template exists
    console.log('\n3. Checking email template...')
    try {
      const VerifyEmail = require('../src/app/(frontend)/components/emails/VerifyEmail').default
      if (VerifyEmail) {
        console.log('   ✅ VerifyEmail template exists')
      } else {
        console.log('   ❌ VerifyEmail template is not properly exported')
      }
    } catch (error) {
      console.log('   ❌ VerifyEmail template not found:', error.message)
    }

    // Test 4: Check if verify page exists
    console.log('\n4. Checking verify page...')
    try {
      const fs = require('fs')
      const verifyPagePath = '../src/app/(frontend)/verify/page.tsx'
      if (fs.existsSync(verifyPagePath)) {
        console.log('   ✅ Verify page exists')
      } else {
        console.log('   ❌ Verify page not found')
      }
    } catch (error) {
      console.log('   ❌ Error checking verify page:', error.message)
    }

    // Test 5: Check if resend verification API exists
    console.log('\n5. Checking resend verification API...')
    try {
      const fs = require('fs')
      const apiPath = '../src/app/api/auth/resend-verification/route.ts'
      if (fs.existsSync(apiPath)) {
        console.log('   ✅ Resend verification API exists')
      } else {
        console.log('   ❌ Resend verification API not found')
      }
    } catch (error) {
      console.log('   ❌ Error checking resend verification API:', error.message)
    }

    // Test 6: Check if Resend is installed
    console.log('\n6. Checking Resend package...')
    try {
      const { Resend } = require('resend')
      console.log('   ✅ Resend package is installed')
    } catch (error) {
      console.log('   ❌ Resend package not found. Run: pnpm add resend')
    }

    console.log('\n🎉 Email verification system test completed!')
    console.log('\nNext steps:')
    console.log('1. Set up your environment variables in .env.local')
    console.log('2. Test user registration with a new email')
    console.log('3. Check your email for verification message')
    console.log('4. Click the verification link to test the flow')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testEmailVerification()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test failed:', error)
    process.exit(1)
  })
