import { Resend } from 'resend'
import { render } from '@react-email/render'
import InvoiceReceipt from '../src/app/(frontend)/components/emails/InvoiceReceipt'

const resend = new Resend(process.env.RESEND_API_KEY!)

// Mock Stripe invoice data
const mockInvoice = {
  id: 'in_1234567890',
  number: 'INV-2024-001',
  amount_paid: 2999, // $29.99 in cents
  currency: 'usd',
  created: Math.floor(Date.now() / 1000),
  customer_email: 'test@example.com',
  customer: 'cus_1234567890',
  hosted_invoice_url: 'https://invoice.stripe.com/i/acct_123/test',
  lines: {
    data: [
      {
        description: 'Pro Plan - Monthly Subscription',
        price: {
          product: {
            name: 'Pro Plan',
          },
        },
      },
    ],
  },
}

async function testStripeWebhook() {
  try {
    console.log('🧪 Testing Stripe Webhook Invoice Payment...')

    // Simulate the webhook processing logic
    const customerEmail = mockInvoice.customer_email
    const customerName = 'Test Customer'

    // Format amount
    const amount = (mockInvoice.amount_paid / 100).toFixed(2)
    const currency = mockInvoice.currency.toUpperCase()
    const date = new Date(mockInvoice.created * 1000).toLocaleDateString()

    // Get description from invoice lines
    let description = 'Subscription payment'
    if (mockInvoice.lines.data.length > 0) {
      const line = mockInvoice.lines.data[0]
      if (line.description) {
        description = line.description
      } else if (
        line.price?.product &&
        typeof line.price.product === 'object' &&
        'name' in line.price.product
      ) {
        description = (line.price.product as any).name
      }
    }

    // Generate URLs
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    const receiptUrl = mockInvoice.hosted_invoice_url || `${appUrl}/dashboard/billing`
    const customerPortalUrl = `${appUrl}/dashboard/billing`

    console.log('📊 Invoice Data:')
    console.log('  - Invoice ID:', mockInvoice.id)
    console.log('  - Invoice Number:', mockInvoice.number)
    console.log('  - Amount:', amount, currency)
    console.log('  - Date:', date)
    console.log('  - Description:', description)
    console.log('  - Customer Email:', customerEmail)

    // Render and send email
    const emailHtml = await render(
      InvoiceReceipt({
        brandName: process.env.BRAND_NAME || 'Test App',
        logoUrl: process.env.BRAND_LOGO_URL,
        appUrl,
        userName: customerName,
        invoiceNumber: mockInvoice.number,
        amount,
        currency,
        date,
        description,
        receiptUrl,
        customerPortalUrl,
      }),
    )

    console.log('✅ Invoice email HTML generated successfully')
    console.log('📧 Email HTML length:', emailHtml.length)

    // Send test email
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: [customerEmail],
      subject: `Payment Receipt - ${process.env.BRAND_NAME || 'Test App'}`,
      html: emailHtml,
    })

    console.log('✅ Invoice/receipt email sent successfully!')
    console.log('📧 Message ID:', result.data?.id)
    console.log('📧 To:', customerEmail)
    console.log('📧 Invoice:', mockInvoice.number)
    console.log('💰 Amount:', amount, currency)
  } catch (error) {
    console.error('❌ Error testing Stripe webhook:', error)
  }
}

// Run the test
testStripeWebhook()
