import { Resend } from 'resend'
import { config } from 'dotenv'

// Load environment variables from .env file
config()

async function testResendConfig() {
  try {
    console.log('🧪 Testing Resend Configuration...')

    // Check environment variables
    console.log('📋 Environment Variables:')
    console.log('  RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set')
    console.log('  EMAIL_FROM:', process.env.EMAIL_FROM || '❌ Not set')

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not set in environment variables')
      return
    }

    if (!process.env.EMAIL_FROM) {
      console.error('❌ EMAIL_FROM is not set in environment variables')
      return
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY)
    console.log('✅ Resend client initialized')

    // Test a simple email
    console.log('📧 Testing simple email...')
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: ['chris@westsidetechsolutions.com'],
      subject: 'Test Email - Resend Configuration',
      html: '<h1>Test Email</h1><p>This is a test email to verify Resend configuration.</p>',
    })

    console.log('✅ Email sent successfully!')
    console.log('📧 Message ID:', result.data?.id)
    console.log('📧 Response:', result)
  } catch (error: any) {
    console.error('❌ Error testing Resend configuration:', error)

    if (error.statusCode) {
      console.error('📊 Error Status Code:', error.statusCode)
    }

    if (error.message) {
      console.error('📝 Error Message:', error.message)
    }

    // Common error messages and solutions
    if (error.message?.includes('Unauthorized')) {
      console.error('💡 Solution: Check if your RESEND_API_KEY is valid')
    }

    if (error.message?.includes('from')) {
      console.error('💡 Solution: Check if your EMAIL_FROM domain is verified in Resend')
    }
  }
}

// Run the test
testResendConfig()
