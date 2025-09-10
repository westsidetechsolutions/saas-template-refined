import payload from 'payload'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import PasswordChanged from '../src/app/(frontend)/components/emails/PasswordChanged'

const resend = new Resend(process.env.RESEND_API_KEY!)

async function testPasswordChangeFlow() {
  try {
    console.log('🧪 Testing Complete Password Change Flow...')

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
        email: 'test-password@example.com',
        password: 'oldpassword123',
        firstName: 'Test',
        lastName: 'User',
      },
    })

    console.log('✅ Test user created:', testUser.id)
    console.log('📧 Email:', testUser.email)

    // Simulate password change by updating the user
    console.log('🔐 Simulating password change...')
    const updatedUser = await payload.update({
      collection: 'users',
      id: testUser.id,
      data: {
        password: 'newpassword123',
      },
    })

    console.log('✅ User password updated')

    // Test password changed email generation
    console.log('📧 Testing password changed email generation...')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    const supportUrl = `${appUrl}/support`
    const when = new Date().toLocaleString()

    const emailHtml = await render(
      PasswordChanged({
        brandName: process.env.BRAND_NAME || 'Test App',
        logoUrl: process.env.BRAND_LOGO_URL,
        appUrl,
        userName: updatedUser.firstName,
        when,
        supportUrl,
      }),
    )

    console.log('✅ Password changed email HTML generated')
    console.log('📧 Email HTML length:', emailHtml.length)

    // Send test password changed email
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: [updatedUser.email],
      subject: `Password Changed - ${process.env.BRAND_NAME || 'Test App'}`,
      html: emailHtml,
    })

    console.log('✅ Password changed email sent successfully!')
    console.log('📧 Message ID:', result.data?.id)
    console.log('📧 To:', updatedUser.email)

    // Clean up - delete test user
    console.log('🧹 Cleaning up test user...')
    await payload.delete({
      collection: 'users',
      id: testUser.id,
    })

    console.log('✅ Test user deleted')
    console.log('🎉 Password change flow test completed successfully!')
  } catch (error) {
    console.error('❌ Error in password change flow test:', error)
  } finally {
    process.exit(0)
  }
}

// Run the test
testPasswordChangeFlow()
