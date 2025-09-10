import 'dotenv/config'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

async function setupWebhook() {
  try {
    console.log('Setting up Stripe webhook...')

    // List existing webhooks
    const existingWebhooks = await stripe.webhookEndpoints.list()
    console.log(`Found ${existingWebhooks.data.length} existing webhooks`)

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/stripe`

    // Check if webhook already exists
    const existingWebhook = existingWebhooks.data.find((webhook) => webhook.url === webhookUrl)

    if (existingWebhook) {
      console.log(`Webhook already exists: ${existingWebhook.id}`)
      console.log(`Webhook URL: ${existingWebhook.url}`)
      console.log(`Webhook Secret: ${existingWebhook.secret}`)
      console.log('\n⚠️  Add this webhook secret to your .env file:')
      console.log(`STRIPE_WEBHOOK_SECRET=${existingWebhook.secret}`)
      return
    }

    // Create new webhook
    const webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
      ],
    })

    console.log('✅ Webhook created successfully!')
    console.log(`Webhook ID: ${webhook.id}`)
    console.log(`Webhook URL: ${webhook.url}`)
    console.log(`Webhook Secret: ${webhook.secret}`)

    console.log('\n📝 Add this to your .env file:')
    console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`)

    console.log('\n🔗 Webhook URL for Stripe Dashboard:')
    console.log(webhookUrl)
  } catch (error) {
    console.error('Error setting up webhook:', error)
  }
}

setupWebhook()
