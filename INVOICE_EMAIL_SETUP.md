# Invoice/Receipt Email Setup

This document explains how the invoice/receipt email functionality works in the application.

## Overview

When a customer makes a successful payment through Stripe, they automatically receive a professional invoice/receipt email. This provides customers with payment confirmation and easy access to their billing information.

## How It Works

### 1. Payment Flow

1. **Customer Payment**: Customer completes payment through Stripe
2. **Stripe Webhook**: Stripe sends `invoice.payment_succeeded` event to your webhook
3. **Webhook Processing**: Your webhook processes the payment event
4. **User Update**: Updates user's payment status in your database
5. **Email Trigger**: Automatically sends invoice/receipt email to customer

### 2. Technical Implementation

#### Stripe Webhook Handler

The webhook handler in `src/app/api/webhooks/stripe/route.ts` processes the `invoice.payment_succeeded` event:

```typescript
case 'invoice.payment_succeeded':
  await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, payload)
  break
```

#### Invoice Processing Function

The `handleInvoicePaymentSucceeded` function:

1. **Extracts customer information** from the invoice
2. **Finds the user** by subscription ID, customer ID, or email
3. **Updates user data** with payment information
4. **Sends invoice email** with payment details

#### Email Content

The invoice email includes:
- **Payment confirmation** with amount and currency
- **Invoice number** and date
- **Description** of what was purchased
- **Receipt link** (Stripe hosted invoice or your billing page)
- **Customer portal link** for account management
- **Professional design** using your brand theme

### 3. Environment Variables

Make sure these environment variables are set:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=notify@yourdomain.com
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
BRAND_NAME=Your App Name
BRAND_LOGO_URL=https://yourdomain.com/logo.png
```

### 4. Stripe Configuration

#### Webhook Endpoint

Configure your Stripe webhook endpoint:
- **URL**: `https://yourdomain.com/api/webhooks/stripe`
- **Events**: `invoice.payment_succeeded`

#### Customer Emails

In your Stripe Dashboard:
1. Go to **Settings** → **Customer emails**
2. **Disable** "Payment receipts" (since you're sending your own)
3. Keep other customer emails enabled as needed

### 5. Testing

#### Test Invoice Email Only

```bash
npx tsx scripts/test-invoice-email.ts
```

#### Test Complete Stripe Webhook Flow

```bash
npx tsx scripts/test-stripe-webhook.ts
```

This test:
1. Simulates a Stripe invoice payment event
2. Processes the payment data
3. Sends the invoice/receipt email
4. Logs all the details

#### Test with Real Stripe Events

1. Use Stripe CLI to forward webhooks locally:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. Create a test payment in Stripe Dashboard
3. Check your webhook logs for the event processing

### 6. Email Preview

You can preview the invoice email in the email preview page:
- Go to `/email-preview`
- Select "Invoice/Receipt" from the dropdown
- Customize the variables
- Send a test email

## Flow Summary

```
Customer Payment → Stripe Webhook → Process Invoice → 
Update User → Send Receipt Email → Customer Receives Email
```

## Data Extraction

The webhook extracts the following data from Stripe invoices:

- **Invoice Number**: `invoice.number` or `invoice.id`
- **Amount**: `invoice.amount_paid` (converted from cents)
- **Currency**: `invoice.currency` (converted to uppercase)
- **Date**: `invoice.created` (converted to readable format)
- **Description**: From invoice line items or product name
- **Customer Email**: `invoice.customer_email` or from customer object
- **Receipt URL**: `invoice.hosted_invoice_url` or your billing page

## User Lookup Strategy

The webhook tries to find the user in this order:

1. **By Subscription ID**: If invoice has a subscription
2. **By Customer ID**: If invoice has a customer
3. **By Email**: If customer email is available

This ensures the email is sent even if the user isn't found in your database.

## Customization

### Email Content

To customize the invoice email content, edit:
`src/app/(frontend)/components/emails/InvoiceReceipt.tsx`

### URLs

The invoice email includes these URLs:
- **Receipt URL**: Stripe hosted invoice or `${APP_URL}/dashboard/billing`
- **Customer Portal**: `${APP_URL}/dashboard/billing`

You can modify these in the webhook handler or update the template.

### Branding

The email uses your brand colors and logo from the theme system. Update the CSS variables in your stylesheet to change the appearance.

## Troubleshooting

### Invoice Email Not Sending

1. **Check Webhook**: Ensure Stripe webhook is properly configured
2. **Check Environment Variables**: Verify all required environment variables are set
3. **Check Resend API**: Ensure your Resend API key is valid and has sending permissions
4. **Check Logs**: Look for any errors in the webhook processing logs

### Test the Flow

Use the test scripts to verify the functionality:

```bash
# Test just the email template
npx tsx scripts/test-invoice-email.ts

# Test the complete webhook flow
npx tsx scripts/test-stripe-webhook.ts
```

### Common Issues

1. **No Customer Email**: Invoice doesn't have customer email
   - Solution: Check if customer object has email
   
2. **User Not Found**: Customer not in your database
   - Solution: Email will still be sent using customer email from Stripe
   
3. **Webhook Not Receiving Events**: Stripe webhook not configured
   - Solution: Check webhook endpoint URL and events in Stripe Dashboard

## Security Considerations

- Webhook signature verification ensures events come from Stripe
- Customer emails are validated before sending
- No sensitive payment data is included in emails
- All links point to secure HTTPS URLs
- Receipt URLs use Stripe's hosted invoice system

## Monitoring

Monitor these metrics:
- Webhook event processing success rate
- Email delivery success rate
- Customer support inquiries about receipts
- Payment confirmation rates
