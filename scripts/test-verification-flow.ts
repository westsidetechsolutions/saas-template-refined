import payload from 'payload'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import WelcomeLightweight from '../src/app/(frontend)/components/emails/WelcomeLightweight'

const resend = new Resend(process.env.RESEND_API_KEY!)

async function testVerificationFlow() {
  try {
    console.log('🧪 Testing Complete Verification Flow...')

    // Initialize Payload
    await payload.init({
      secret: process.env.PAYLOAD_SECRET!,
      local: true,
    })

    // Create a test user
    console.log('📝 Creating test user...')
    const testUser = await payload.create({
      collection: 'users',
      data: {
        email: 'test-verification@example.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User',
      },
    })

    console.log('✅ Test user created:', testUser.id)
    console.log('📧 Email:', testUser.email)
    console.log('🔍 Verification status:', (testUser as any)._verified)

    // Simulate email verification by updating the user
    console.log('🔐 Simulating email verification...')
    const verifiedUser = await payload.update({
      collection: 'users',
      id: testUser.id,
      data: {
        _verified: true,
      },
    })

    console.log('✅ User verification status updated')
    console.log('🔍 New verification status:', (verifiedUser as any)._verified)

    // Test welcome email generation
    console.log('📧 Testing welcome email generation...')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    const gettingStartedUrl = `${appUrl}/dashboard`
    const docsUrl = `${appUrl}/docs`

    const emailHtml = await render(
      WelcomeLightweight({
        brandName: process.env.BRAND_NAME || 'Test App',
        logoUrl: process.env.BRAND_LOGO_URL,
        appUrl,
        userName: verifiedUser.firstName,
        gettingStartedUrl,
        docsUrl,
      }),
    )

    console.log('✅ Welcome email HTML generated')
    console.log('📧 Email HTML length:', emailHtml.length)

    // Send test welcome email
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: [verifiedUser.email],
      subject: `Welcome to ${process.env.BRAND_NAME || 'Test App'}!`,
      html: emailHtml,
    })

    console.log('✅ Welcome email sent successfully!')
    console.log('📧 Message ID:', result.data?.id)
    console.log('📧 To:', verifiedUser.email)

    // Clean up - delete test user
    console.log('🧹 Cleaning up test user...')
    await payload.delete({
      collection: 'users',
      id: testUser.id,
    })

    console.log('✅ Test user deleted')
    console.log('🎉 Verification flow test completed successfully!')
  } catch (error) {
    console.error('❌ Error in verification flow test:', error)
  } finally {
    process.exit(0)
  }
}

// Run the test
testVerificationFlow()
