import { Resend } from 'resend'
import { render } from '@react-email/render'
import WelcomeLightweight from '../src/app/(frontend)/components/emails/WelcomeLightweight'

const resend = new Resend(process.env.RESEND_API_KEY!)

async function testWelcomeEmail() {
  try {
    console.log('🧪 Testing Welcome Email...')

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    const gettingStartedUrl = `${appUrl}/dashboard`
    const docsUrl = `${appUrl}/docs`

    const emailHtml = await render(
      WelcomeLightweight({
        brandName: process.env.BRAND_NAME || 'Test App',
        logoUrl: process.env.BRAND_LOGO_URL,
        appUrl,
        userName: 'Test User',
        gettingStartedUrl,
        docsUrl,
      }),
    )

    console.log('✅ Email HTML generated successfully')
    console.log('📧 Email HTML length:', emailHtml.length)

    // Send test email
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: ['chris@westsidetechsolutions.com'],
      subject: `Test Welcome Email - ${process.env.BRAND_NAME || 'Test App'}`,
      html: emailHtml,
    })

    console.log('✅ Test welcome email sent successfully!')
    console.log('📧 Message ID:', result.data?.id)
    console.log('📧 To: chris@westsidetechsolutions.com')
  } catch (error) {
    console.error('❌ Error testing welcome email:', error)
  }
}

// Run the test
testWelcomeEmail()
