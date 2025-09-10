import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { createPortalSession } from '@/lib/stripe/createPortalSession'

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const payload = await getPayload({ config })

    // Check if user is authenticated
    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
      console.log('❌ No authenticated user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 User data for portal session:', {
      id: user.id,
      email: user.email,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      subscriptionStatus: user.subscriptionStatus,
    })

    // Check if user has a Stripe customer ID
    if (!user.stripeCustomerId) {
      console.log('❌ No stripeCustomerId found for user:', user.id)
      return NextResponse.json(
        {
          error: 'No billing information found. Please subscribe to a plan first.',
        },
        { status: 400 },
      )
    }

    const { returnUrl } = await request.json()

    console.log('Creating portal session for user:', {
      userId: user.id,
      customerId: user.stripeCustomerId,
      returnUrl,
    })

    // Create portal session
    const session = await createPortalSession({
      userId: user.id,
      returnUrl,
    })

    console.log('Portal session created successfully:', session.url)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating portal session:', error)

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('No Stripe customer found')) {
        return NextResponse.json(
          {
            error: 'No billing information found. Please subscribe to a plan first.',
          },
          { status: 400 },
        )
      }
      if (error.message.includes('User not found')) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to create portal session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
