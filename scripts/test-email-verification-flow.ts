import { config } from 'dotenv'
config()

async function testEmailVerificationFlow() {
  console.log('🧪 Testing Email Verification Flow...\n')

  // Check environment variables
  console.log('📋 Environment Variables:')
  console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set'}`)
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM ? '✅ Set' : '❌ Not set'}`)
  console.log(`NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL ? '✅ Set' : '❌ Not set'}`)
  console.log(`BRAND_NAME: ${process.env.BRAND_NAME ? '✅ Set' : '❌ Not set'}`)
  console.log(`BRAND_LOGO_URL: ${process.env.BRAND_LOGO_URL ? '✅ Set' : '❌ Not set'}`)

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    console.log(
      '\n⚠️  NEXT_PUBLIC_APP_URL is not set. Setting to http://localhost:3000 for testing...',
    )
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  }

  // Test signup API
  console.log('\n📝 Testing Signup API...')
  try {
    const signupResponse = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test-verification@example.com',
        password: 'testpassword123',
      }),
    })

    const signupResult = await signupResponse.json()

    if (signupResponse.ok) {
      console.log('✅ Signup successful:', signupResult.user.email)
      console.log('📧 Verification email should have been sent')
    } else {
      console.log('❌ Signup failed:', signupResult.error)
    }
  } catch (error) {
    console.log('❌ Signup API error:', error)
  }

  // Test verification API endpoint
  console.log('\n🔗 Testing Verification API Endpoint...')
  try {
    const testToken = 'test-token-123'
    const verifyResponse = await fetch(`http://localhost:3000/api/users/verify/${testToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const verifyResult = await verifyResponse.json()

    if (verifyResponse.status === 400) {
      console.log('✅ Verification API endpoint is working (expected error for invalid token)')
    } else {
      console.log('⚠️  Verification API response:', verifyResult)
    }
  } catch (error) {
    console.log('❌ Verification API error:', error)
  }

  console.log('\n🎯 Next Steps:')
  console.log('1. Sign up with a real email address')
  console.log('2. Check your email for the verification link')
  console.log('3. Click the verification link')
  console.log('4. Try logging in with the verified account')
}

testEmailVerificationFlow().catch(console.error)
