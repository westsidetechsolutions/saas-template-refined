import Stripe from 'stripe'
import { getPayload } from 'payload'
import config from '@/payload.config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export interface CreatePortalSessionParams {
  userId: string
  returnUrl?: string
}

export interface PortalSession {
  url: string
}

export async function createPortalSession(
  params: CreatePortalSessionParams,
): Promise<PortalSession> {
  const { userId, returnUrl } = params

  if (!userId) {
    throw new Error('User ID is required')
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key is not configured')
  }

  const payload = await getPayload({ config })

  // Get user
  const user = await payload.findByID({
    collection: 'users',
    id: userId,
  })

  if (!user) {
    throw new Error('User not found')
  }

  if (!user.stripeCustomerId) {
    throw new Error('No Stripe customer found for user')
  }

  console.log('Creating portal session for customer:', user.stripeCustomerId)

  try {
    console.log('🔍 Stripe configuration:', {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7),
      apiVersion: '2025-07-30.basil',
    })

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url:
        returnUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings`,
    })

    console.log('✅ Portal session created successfully:', {
      sessionId: session.id,
      sessionUrl: session.url,
      customerId: user.stripeCustomerId,
    })

    return {
      url: session.url!,
    }
  } catch (error) {
    console.error('Stripe portal session creation error:', error)

    if (error instanceof Stripe.errors.StripeError) {
      if (error.code === 'resource_missing') {
        throw new Error('Customer not found in Stripe')
      }
      if (error.code === 'invalid_request_error') {
        throw new Error('Invalid request to Stripe')
      }
    }

    throw error
  }
}
