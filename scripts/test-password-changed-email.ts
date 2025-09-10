import { Resend } from 'resend'
import { render } from '@react-email/render'
import PasswordChanged from '../src/app/(frontend)/components/emails/PasswordChanged'

const resend = new Resend(process.env.RESEND_API_KEY!)

async function testPasswordChangedEmail() {
  try {
    console.log('🧪 Testing Password Changed Email...')

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    const supportUrl = `${appUrl}/support`
    const when = new Date().toLocaleString()

    const emailHtml = await render(
      PasswordChanged({
        brandName: process.env.BRAND_NAME || 'Test App',
        logoUrl: process.env.BRAND_LOGO_URL,
        appUrl,
        userName: 'Test User',
        when,
        supportUrl,
      }),
    )

    console.log('✅ Password changed email HTML generated successfully')
    console.log('📧 Email HTML length:', emailHtml.length)

    // Send test email
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: ['chris@westsidetechsolutions.com'],
      subject: `Test Password Changed Email - ${process.env.BRAND_NAME || 'Test App'}`,
      html: emailHtml,
    })

    console.log('✅ Test password changed email sent successfully!')
    console.log('📧 Message ID:', result.data?.id)
    console.log('📧 To: chris@westsidetechsolutions.com')
  } catch (error) {
    console.error('❌ Error testing password changed email:', error)
  }
}

// Run the test
testPasswordChangedEmail()
