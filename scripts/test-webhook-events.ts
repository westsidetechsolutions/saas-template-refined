import 'dotenv/config'
import Stripe from 'stripe'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

async function testWebhookEvents() {
  try {
    console.log('🧪 Testing webhook events...')

    const payload = await getPayload({ config })

    // Get all users with subscriptions
    const users = await payload.find({
      collection: 'users',
      where: {
        stripeSubscriptionId: {
          exists: true,
        },
      },
    })

    console.log(`Found ${users.docs.length} users with subscriptions`)

    for (const user of users.docs) {
      console.log(`\n👤 Testing user: ${user.email}`)
      console.log(`   - Subscription ID: ${user.stripeSubscriptionId}`)
      console.log(`   - Current Status: ${user.subscriptionStatus}`)

      if (user.stripeSubscriptionId) {
        try {
          // Fetch current subscription from Stripe
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
          console.log(`   - Stripe Status: ${subscription.status}`)
          console.log(`   - Cancel at period end: ${subscription.cancel_at_period_end}`)

          // Check if status is out of sync
          if (user.subscriptionStatus !== subscription.status) {
            console.log(
              `   ⚠️  Status mismatch! Local: ${user.subscriptionStatus}, Stripe: ${subscription.status}`,
            )

            // Update the user to match Stripe
            await payload.update({
              collection: 'users',
              id: user.id,
              data: {
                subscriptionStatus: subscription.status,
                subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              },
            })
            console.log(`   ✅ Updated user status to: ${subscription.status}`)
          } else {
            console.log(`   ✅ Status is in sync`)
          }

          // Check if subscription is canceled but still active
          if (subscription.cancel_at_period_end && subscription.status === 'active') {
            console.log(
              `   📅 Subscription is canceled but active until: ${new Date(subscription.current_period_end * 1000).toISOString()}`,
            )
          }
        } catch (error) {
          console.log(`   ❌ Error fetching subscription: ${error}`)

          // If subscription doesn't exist in Stripe, mark as canceled
          if (error instanceof Error && error.message.includes('No such subscription')) {
            console.log(`   🔄 Marking subscription as canceled (not found in Stripe)`)
            await payload.update({
              collection: 'users',
              id: user.id,
              data: {
                subscriptionStatus: 'canceled',
                stripeSubscriptionId: null,
              },
            })
          }
        }
      }
    }

    console.log('\n✅ Webhook event testing completed')
  } catch (error) {
    console.error('❌ Error testing webhook events:', error)
  }
}

testWebhookEvents()
  .then(() => {
    console.log('\n🎉 Test completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test failed:', error)
    process.exit(1)
  })
