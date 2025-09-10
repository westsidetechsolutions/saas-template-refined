import dotenv from 'dotenv'
import Stripe from 'stripe'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

async function checkWebhookLogs() {
  try {
    console.log('🔍 Checking webhook logs...\n')

    // Get recent webhook events
    const events = await stripe.events.list({
      limit: 20,
    })

    console.log(`📊 Found ${events.data.length} recent webhook events:\n`)

    events.data.forEach((event, index) => {
      console.log(`${index + 1}. Event: ${event.type}`)
      console.log(`   ID: ${event.id}`)
      console.log(`   Created: ${new Date(event.created * 1000).toLocaleString()}`)
      console.log(`   Livemode: ${event.livemode}`)

      // Check if this is related to subscriptions
      if (event.type.includes('subscription') || event.type.includes('checkout')) {
        console.log(`   ⭐ SUBSCRIPTION RELATED EVENT`)

        // Try to extract relevant data
        if (event.data?.object) {
          const obj = event.data.object as any

          if (obj.customer_email) {
            console.log(`   Customer Email: ${obj.customer_email}`)
          }

          if (obj.customer) {
            console.log(`   Customer ID: ${obj.customer}`)
          }

          if (obj.subscription) {
            console.log(`   Subscription ID: ${obj.subscription}`)
          }

          if (obj.id && event.type === 'checkout.session.completed') {
            console.log(`   Checkout Session ID: ${obj.id}`)
          }
        }
      }

      console.log('')
    })

    // Check webhook endpoints
    console.log('🔗 Checking webhook endpoints...\n')

    const webhookEndpoints = await stripe.webhookEndpoints.list()

    if (webhookEndpoints.data.length === 0) {
      console.log('❌ No webhook endpoints found!')
      console.log('You need to create a webhook endpoint in your Stripe dashboard.')
      console.log('URL should be: https://yourdomain.com/api/webhooks/stripe')
      console.log('Or for local testing: https://your-ngrok-url.ngrok.io/api/webhooks/stripe')
    } else {
      webhookEndpoints.data.forEach((endpoint, index) => {
        console.log(`${index + 1}. Webhook Endpoint:`)
        console.log(`   URL: ${endpoint.url}`)
        console.log(`   Status: ${endpoint.status}`)
        console.log(`   Events: ${endpoint.enabled_events.join(', ')}`)
        console.log(`   Created: ${new Date(endpoint.created * 1000).toLocaleString()}`)
        console.log('')
      })
    }

    // Check recent subscriptions
    console.log('💳 Checking recent subscriptions...\n')

    const subscriptions = await stripe.subscriptions.list({
      limit: 10,
    })

    console.log(`📊 Found ${subscriptions.data.length} recent subscriptions:\n`)

    subscriptions.data.forEach((subscription, index) => {
      console.log(`${index + 1}. Subscription: ${subscription.id}`)
      console.log(`   Status: ${subscription.status}`)
      console.log(`   Customer: ${subscription.customer}`)
      console.log(`   Created: ${new Date(subscription.created * 1000).toLocaleString()}`)
      console.log(
        `   Current Period End: ${new Date(subscription.current_period_end * 1000).toLocaleString()}`,
      )

      if (subscription.items.data.length > 0) {
        const item = subscription.items.data[0]
        console.log(`   Price ID: ${item.price.id}`)
        console.log(`   Amount: $${(item.price.unit_amount || 0) / 100}`)
      }

      console.log('')
    })

    // Check recent checkout sessions
    console.log('🛒 Checking recent checkout sessions...\n')

    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
    })

    console.log(`📊 Found ${sessions.data.length} recent checkout sessions:\n`)

    sessions.data.forEach((session, index) => {
      console.log(`${index + 1}. Checkout Session: ${session.id}`)
      console.log(`   Status: ${session.status}`)
      console.log(`   Customer Email: ${session.customer_email}`)
      console.log(`   Customer: ${session.customer}`)
      console.log(`   Subscription: ${session.subscription}`)
      console.log(`   Created: ${new Date(session.created * 1000).toLocaleString()}`)
      console.log(`   Mode: ${session.mode}`)

      if (session.metadata) {
        console.log(`   Metadata: ${JSON.stringify(session.metadata)}`)
      }

      console.log('')
    })
  } catch (error) {
    console.error('❌ Error checking webhook logs:', error)
  }

  process.exit(0)
}

checkWebhookLogs()
