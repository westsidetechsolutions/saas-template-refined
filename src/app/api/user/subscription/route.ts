import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const payload = await getPayload({ config })

    // Get the authenticated user
    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has a subscription
    if (!user.stripeSubscriptionId) {
      return NextResponse.json({ subscription: null })
    }

    // Fetch subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId as string)

    // Get the plan details
    const plan = {
      id: subscription.items.data[0]?.price.id,
      name: subscription.items.data[0]?.price.product as string,
      price: subscription.items.data[0]?.price.unit_amount || 0,
      interval: subscription.items.data[0]?.price.recurring?.interval || 'month',
    }

    // Get product name
    if (typeof plan.name === 'string') {
      const product = await stripe.products.retrieve(plan.name)
      plan.name = product.name
    }

    const subscriptionData = {
      id: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: (() => {
        const periodEnd = subscription.items.data[0]?.current_period_end
        if (periodEnd && typeof periodEnd === 'number') {
          return new Date(periodEnd * 1000).toISOString()
        }
        console.log('Warning: Invalid current_period_end in API:', periodEnd)
        return new Date().toISOString() // fallback to current date
      })(),
      plan,
    }

    return NextResponse.json({ subscription: subscriptionData })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}
