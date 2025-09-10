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
    const { newPriceId } = await request.json()
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

    if (!newPriceId) {
      return NextResponse.json({ error: 'New price ID is required' }, { status: 400 })
    }

    // Create a checkout session for the upgrade
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: newPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
      customer: user.stripeCustomerId as string,
      subscription_data: {
        metadata: {
          upgrade_from: user.stripeSubscriptionId,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        app: process.env.STRIPE_APP_NAME || 'saas-app',
        upgrade: 'true',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating upgrade session:', error)
    return NextResponse.json({ error: 'Failed to create upgrade session' }, { status: 500 })
  }
}
