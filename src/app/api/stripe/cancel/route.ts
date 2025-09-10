import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const payload = await getPayload({ config })

    // Get the authenticated user
    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    // Cancel the subscription at period end
    const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId as string, {
      cancel_at_period_end: true,
    })

    // Update the user's subscription status
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        subscriptionStatus: subscription.status,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
