import Stripe from 'stripe'
import { config } from 'dotenv'

// Load environment variables
config()

async function checkStripeSubscription(email: string) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables')
    console.log('💡 Make sure your .env file contains STRIPE_SECRET_KEY=sk_...')
    process.exit(1)
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
  })

  try {
    console.log('🔍 Checking Stripe for user:', email)

    // First, find the customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    })

    if (customers.data.length === 0) {
      console.log('❌ No Stripe customer found with email:', email)
      return
    }

    const customer = customers.data[0]
    console.log('✅ Found Stripe customer:', customer.id)

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all', // Get all statuses
    })

    console.log('\n📊 Stripe Subscription Data')
    console.log('=====================================')
    console.log(`Customer ID: ${customer.id}`)
    console.log(`Customer Email: ${customer.email}`)
    console.log(`Total Subscriptions: ${subscriptions.data.length}`)

    if (subscriptions.data.length === 0) {
      console.log('❌ No subscriptions found for this customer')
      return
    }

    // Show all subscriptions
    subscriptions.data.forEach((subscription, index) => {
      console.log(`\n📋 Subscription ${index + 1}:`)
      console.log(`  ID: ${subscription.id}`)
      console.log(`  Status: ${subscription.status}`)

      // Safely handle dates
      try {
        const currentPeriodStart = (subscription as any).current_period_start
        const currentPeriodEnd = (subscription as any).current_period_end

        if (currentPeriodStart) {
          console.log(
            `  Current Period Start: ${new Date(currentPeriodStart * 1000).toISOString()}`,
          )
        }
        if (currentPeriodEnd) {
          console.log(`  Current Period End: ${new Date(currentPeriodEnd * 1000).toISOString()}`)
        }
      } catch (error) {
        console.log(`  Current Period: Error parsing dates`)
      }

      console.log(`  Created: ${new Date(subscription.created * 1000).toISOString()}`)
      console.log(
        `  Canceled At: ${subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : 'Not canceled'}`,
      )

      // Show items
      subscription.items.data.forEach((item, itemIndex) => {
        console.log(`  Item ${itemIndex + 1}:`)
        console.log(`    Price ID: ${item.price.id}`)
        console.log(`    Product ID: ${item.price.product}`)
        console.log(`    Amount: ${item.price.unit_amount} ${item.price.currency}`)
        console.log(`    Interval: ${item.price.recurring?.interval}`)
      })
    })

    // Check if any subscription is active
    const activeSubscriptions = subscriptions.data.filter(
      (sub) => sub.status === 'active' || sub.status === 'trialing',
    )

    console.log('\n🎯 Active Subscriptions Analysis')
    console.log('=====================================')
    console.log(`Active/Trialing Subscriptions: ${activeSubscriptions.length}`)

    if (activeSubscriptions.length > 0) {
      console.log('✅ User has active Stripe subscription(s)')
      console.log('💡 The issue is that this data is not synced to the database')
    } else {
      console.log('❌ No active Stripe subscriptions found')
    }
  } catch (error) {
    console.error('Error checking Stripe subscription:', error)
  }

  process.exit(0)
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('Usage: npm run check-stripe <email>')
  console.log('Example: npm run check-stripe user@example.com')
  process.exit(1)
}

checkStripeSubscription(email)
