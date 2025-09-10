import dotenv from 'dotenv'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import Stripe from 'stripe'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

async function checkUserStripeStatus(email: string) {
  try {
    console.log(`🔍 Checking Stripe status for user: ${email}`)

    const payload = await getPayload({ config })

    // Find the user by email
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    })

    if (users.docs.length === 0) {
      console.log(`❌ No user found with email: ${email}`)
      return
    }

    const user = users.docs[0]
    console.log(`👤 Found user: ${user.email} (ID: ${user.id})`)
    console.log(`📊 User data:`)
    console.log(`   - stripeCustomerId: ${user.stripeCustomerId || 'Not set'}`)
    console.log(`   - stripeSubscriptionId: ${user.stripeSubscriptionId || 'Not set'}`)
    console.log(`   - subscriptionStatus: ${user.subscriptionStatus || 'Not set'}`)
    console.log(`   - subscriptionPlan: ${user.subscriptionPlan || 'Not set'}`)

    // Check if user has stripeCustomerId
    if (!user.stripeCustomerId) {
      console.log('\n❌ User has no stripeCustomerId')
      console.log('💡 This means the user has not subscribed to any plan yet.')
      console.log('💡 To fix this, the user needs to:')
      console.log('   1. Go to /pricing')
      console.log('   2. Subscribe to a plan')
      console.log('   3. Complete the checkout process')
      return
    }

    console.log(`\n✅ User has stripeCustomerId: ${user.stripeCustomerId}`)

    // Verify the customer exists in Stripe
    try {
      const customer = await stripe.customers.retrieve(user.stripeCustomerId)
      console.log(`✅ Stripe customer exists: ${customer.id}`)
      console.log(`   - Email: ${customer.email}`)
      console.log(`   - Name: ${customer.name}`)
    } catch (error) {
      console.log(`❌ Stripe customer not found: ${user.stripeCustomerId}`)
      console.log('💡 This might indicate a data inconsistency.')
      return
    }

    // Check for subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      limit: 10,
    })

    console.log(`\n📋 Found ${subscriptions.data.length} subscription(s):`)

    if (subscriptions.data.length === 0) {
      console.log('❌ No subscriptions found for this customer')
      console.log('💡 The user may have canceled their subscription or it expired.')
    } else {
      subscriptions.data.forEach((subscription, index) => {
        console.log(`\n   Subscription ${index + 1}:`)
        console.log(`   - ID: ${subscription.id}`)
        console.log(`   - Status: ${subscription.status}`)
        console.log(
          `   - Current period end: ${new Date(subscription.current_period_end * 1000).toISOString()}`,
        )
        console.log(`   - Cancel at period end: ${subscription.cancel_at_period_end}`)

        subscription.items.data.forEach((item, itemIndex) => {
          console.log(`   - Item ${itemIndex + 1}: ${item.price.id}`)
        })
      })
    }

    // Test customer portal creation
    console.log('\n🧪 Testing customer portal creation...')
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: 'http://localhost:3000/dashboard/settings',
      })
      console.log(`✅ Customer portal session created successfully`)
      console.log(`   - Session URL: ${session.url}`)
    } catch (error) {
      console.log(`❌ Failed to create customer portal session:`)
      if (error instanceof Error) {
        console.log(`   - Error: ${error.message}`)
      }
    }
  } catch (error) {
    console.error('❌ Error checking user Stripe status:', error)
  }
}

// Get email from command line arguments
const email = process.argv[2]

if (!email) {
  console.log('Usage: npm run check-user-stripe <email>')
  console.log('Example: npm run check-user-stripe user@example.com')
  process.exit(1)
}

checkUserStripeStatus(email)
  .then(() => {
    console.log('\n✅ Check completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Check failed:', error)
    process.exit(1)
  })
