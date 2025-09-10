import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayload } from 'payload'
import config from '@/payload.config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session.customer_email) {
      return NextResponse.json({ error: 'No customer email found' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Check if user exists
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: session.customer_email,
        },
      },
    })

    if (users.docs.length > 0) {
      // User exists - check if they have subscription
      const user = users.docs[0]
      if (user.stripeSubscriptionId) {
        return NextResponse.json({
          userCreated: false,
          message: 'Payment successful! Your subscription is now active.',
        })
      } else {
        return NextResponse.json({
          userCreated: false,
          message: 'Payment successful! Please check your email for account details.',
        })
      }
    } else {
      // User doesn't exist - they should have been created by webhook
      // Check if webhook has processed this session
      if (session.payment_status === 'paid') {
        return NextResponse.json({
          userCreated: true,
          message: 'Account created successfully! Please check your email for login details.',
          // Note: We can't return the temp password here for security reasons
          // The webhook logs will show it, or you could implement email sending
        })
      } else {
        return NextResponse.json({
          userCreated: false,
          message: 'Payment processing... Please check your email for account details.',
        })
      }
    }
  } catch (error) {
    console.error('Error verifying session:', error)
    return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 })
  }
}
