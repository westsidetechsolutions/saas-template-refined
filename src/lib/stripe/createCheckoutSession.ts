import Stripe from 'stripe'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserBilling } from '../organizations'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export interface CreateCheckoutSessionParams {
  priceId: string
  userId: string
  successUrl?: string
  cancelUrl?: string
  allowPromotionCodes?: boolean
}

export interface CheckoutSession {
  url: string
  sessionId: string
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams,
): Promise<CheckoutSession> {
  const { priceId, userId, successUrl, cancelUrl, allowPromotionCodes = true } = params

  if (!priceId) {
    throw new Error('Price ID is required')
  }

  if (!userId) {
    throw new Error('User ID is required')
  }

  const payload = await getPayload({ config })

  // Get user details
  const user = await payload.findByID({
    collection: 'users',
    id: userId,
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Create or get Stripe customer
  let customerId = user.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
      metadata: {
        userId: userId,
      },
    })
    customerId = customer.id

    // Update user with customer ID
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        stripeCustomerId: customerId,
      },
    })
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url:
      successUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:
      cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing/canceled`,
    allow_promotion_codes: allowPromotionCodes,
    billing_address_collection: 'required',
    metadata: {
      userId: userId,
      priceId: priceId,
    },
    client_reference_id: userId, // Use user ID as client reference
  })

  return {
    url: session.url!,
    sessionId: session.id,
  }
}
