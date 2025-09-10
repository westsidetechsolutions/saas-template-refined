import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { createCheckoutSession } from '@/lib/stripe/createCheckoutSession'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const planId = searchParams.get('planId')
  const trial = searchParams.get('trial')
  const finalNext = searchParams.get('finalNext')

  const headersList = await headers()
  const payload = await getPayload({ config })

  try {
    // Check if user is authenticated
    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
      // Not authenticated - redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // User is authenticated - handle the action
    if (trial) {
      // Handle trial flow
      if (user.hasUsedTrial) {
        // User has already used trial
        return NextResponse.redirect(new URL('/pricing?message=trial-used', request.url))
      }

      // Set trial flags and redirect to dashboard
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          hasUsedTrial: true,
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
        },
      })

      return NextResponse.redirect(new URL('/dashboard?trial=started', request.url))
    }

    if (planId) {
      // Handle plan purchase flow
      try {
        const session = await createCheckoutSession({
          priceId: planId,
          userId: user.id,
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing/canceled`,
        })

        return NextResponse.redirect(session.url)
      } catch (error) {
        console.error('Error creating checkout session:', error)
        return NextResponse.redirect(new URL('/pricing?error=checkout-failed', request.url))
      }
    }

    // No valid action - redirect to final destination or dashboard
    if (finalNext) {
      return NextResponse.redirect(new URL(finalNext, request.url))
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    console.error('Error in post-login route:', error)
    return NextResponse.redirect(new URL('/dashboard?error=unknown', request.url))
  }
}
