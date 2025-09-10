import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export interface CheckoutSessionParams {
  priceId: string
  successUrl?: string
  cancelUrl?: string
  customerEmail?: string
  customerName?: string
  createAccount?: boolean
}

export interface CheckoutSession {
  url: string
  sessionId: string
}

export const createCheckoutSession = async (
  params: CheckoutSessionParams,
): Promise<CheckoutSession> => {
  const { priceId, successUrl, cancelUrl, customerEmail, customerName, createAccount } = params

  if (!priceId) {
    throw new Error('Price ID is required')
  }

  // Create a checkout session
  const session = await stripe.checkout.sessions.create({
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
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:
      cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
    customer_email: customerEmail,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    metadata: {
      app: process.env.STRIPE_APP_NAME || 'saas-app',
      createAccount: createAccount ? 'true' : 'false',
      customerName: customerName || '',
    },
  })

  return {
    url: session.url!,
    sessionId: session.id,
  }
}
