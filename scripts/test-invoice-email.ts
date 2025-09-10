import { Resend } from 'resend'
import { render } from '@react-email/render'
import InvoiceReceipt from '../src/app/(frontend)/components/emails/InvoiceReceipt'

const resend = new Resend(process.env.RESEND_API_KEY!)

async function testInvoiceEmail() {
  try {
    console.log('🧪 Testing Invoice/Receipt Email...')

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    const receiptUrl = `${appUrl}/dashboard/billing`
    const customerPortalUrl = `${appUrl}/dashboard/billing`

    const emailHtml = await render(
      InvoiceReceipt({
        brandName: process.env.BRAND_NAME || 'Test App',
        logoUrl: process.env.BRAND_LOGO_URL,
        appUrl,
        userName: 'Test User',
        invoiceNumber: 'INV-2024-001',
        amount: '29.99',
        currency: 'USD',
        date: new Date().toLocaleDateString(),
        description: 'Pro Plan - Monthly Subscription',
        receiptUrl,
        customerPortalUrl,
      }),
    )

    console.log('✅ Invoice email HTML generated successfully')
    console.log('📧 Email HTML length:', emailHtml.length)

    // Send test email
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: ['chris@westsidetechsolutions.com'],
      subject: `Test Invoice/Receipt Email - ${process.env.BRAND_NAME || 'Test App'}`,
      html: emailHtml,
    })

    console.log('✅ Test invoice email sent successfully!')
    console.log('📧 Message ID:', result.data?.id)
    console.log('📧 To: chris@westsidetechsolutions.com')
  } catch (error) {
    console.error('❌ Error testing invoice email:', error)
  }
}

// Run the test
testInvoiceEmail()
