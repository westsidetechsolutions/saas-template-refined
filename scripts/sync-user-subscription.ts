import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables from the project root BEFORE importing config
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { getPayload } from 'payload'
import config from '../src/payload.config'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

async function syncUserSubscription(email: string) {
  try {
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

    // Check if user has stripeCustomerId
    if (!user.stripeCustomerId) {
      console.log('❌ User has no stripeCustomerId')

      // Try to find customer by email in Stripe
      const customers = await stripe.customers.list({
        email: email,
        limit: 1,
      })

      if (customers.data.length > 0) {
        const customer = customers.data[0]
        console.log(`✅ Found Stripe customer: ${customer.id}`)

        // Update user with stripeCustomerId
        await payload.update({
          collection: 'users',
          id: user.id,
          data: {
            stripeCustomerId: customer.id,
          },
        })
        console.log('✅ Updated user with stripeCustomerId')

        // Now check for subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          limit: 1,
        })

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0]
          console.log(`✅ Found active subscription: ${subscription.id}`)

          // Update user with subscription data
          await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              subscriptionCurrentPeriodEnd: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : undefined,
              subscriptionPlan: subscription.items.data[0]?.price.product as string,
            },
          })
          console.log('✅ Updated user with subscription data')
        } else {
          console.log('❌ No active subscriptions found for this customer')
        }
      } else {
        console.log('❌ No Stripe customer found with this email')
      }
    } else {
      console.log(`✅ User has stripeCustomerId: ${user.stripeCustomerId}`)

      // Check if user has stripeSubscriptionId
      if (!user.stripeSubscriptionId) {
        console.log('❌ User has no stripeSubscriptionId')

        // Find subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          limit: 1,
        })

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0]
          console.log(`✅ Found active subscription: ${subscription.id}`)

          // Update user with subscription data
          await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              subscriptionCurrentPeriodEnd: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : undefined,
              subscriptionPlan: subscription.items.data[0]?.price.product as string,
            },
          })
          console.log('✅ Updated user with subscription data')
        } else {
          console.log('❌ No active subscriptions found for this customer')
        }
      } else {
        console.log(`✅ User has stripeSubscriptionId: ${user.stripeSubscriptionId}`)

        // Verify the subscription still exists and is active
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
          console.log(
            `✅ Subscription verified: ${subscription.id} (Status: ${subscription.status})`,
          )

          // Update subscription data to ensure it's current
          await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              subscriptionStatus: subscription.status,
              subscriptionCurrentPeriodEnd: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : undefined,
              subscriptionPlan: subscription.items.data[0]?.price.product as string,
            },
          })
          console.log('✅ Updated user with current subscription data')
        } catch (error) {
          console.log('❌ Error retrieving subscription from Stripe:', error)
        }
      }
    }

    // Show final user state
    const updatedUser = await payload.findByID({
      collection: 'users',
      id: user.id,
    })

    console.log('\n📊 Final User State:')
    console.log(`Email: ${updatedUser.email}`)
    console.log(`Stripe Customer ID: ${updatedUser.stripeCustomerId || 'None'}`)
    console.log(`Stripe Subscription ID: ${updatedUser.stripeSubscriptionId || 'None'}`)
    console.log(`Subscription Status: ${updatedUser.subscriptionStatus || 'None'}`)
    console.log(`Subscription Plan: ${updatedUser.subscriptionPlan || 'None'}`)
    console.log(`Current Period End: ${updatedUser.subscriptionCurrentPeriodEnd || 'None'}`)
  } catch (error) {
    console.error('❌ Error syncing user subscription:', error)
  }

  process.exit(0)
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('❌ Please provide an email address as an argument')
  console.log('Usage: pnpm sync-user-subscription <email>')
  process.exit(1)
}

syncUserSubscription(email)
