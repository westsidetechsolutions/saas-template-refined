import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { createCheckoutSession } from '@/lib/stripe/createCheckoutSession'
import { getUserBilling } from '@/lib/organizations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId')
    const trial = searchParams.get('trial')
    const next = searchParams.get('next')

    const headersList = await headers()
    const payload = await getPayload({ config })

    // Check if user is authenticated
    const { user } = await payload.auth({ headers: headersList })

    // If NOT authenticated, redirect to login with params
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', '/post-login')
      if (planId) loginUrl.searchParams.set('planId', planId)
      if (trial) loginUrl.searchParams.set('trial', trial)
      if (next) loginUrl.searchParams.set('finalNext', next)

      return NextResponse.redirect(loginUrl)
    }

    // User is authenticated - handle the action
    if (trial === '1') {
      // Handle trial
      const userBilling = await getUserBilling(user.id)

      // Check if user has already used trial
      if (userBilling.hasUsedTrial) {
        // Redirect to pricing with message
        const pricingUrl = new URL('/pricing', request.url)
        pricingUrl.searchParams.set('message', 'trial_used')
        return NextResponse.redirect(pricingUrl)
      }

      // Check if user already has active subscription or is in grace period
      if (
        userBilling.subscriptionStatus === 'active' ||
        userBilling.subscriptionStatus === 'trialing' ||
        (userBilling.subscriptionStatus === 'canceled' &&
          userBilling.subscriptionCurrentPeriodEnd &&
          new Date(userBilling.subscriptionCurrentPeriodEnd) > new Date())
      ) {
        // Redirect to dashboard
        const dashboardUrl = new URL('/dashboard', request.url)
        dashboardUrl.searchParams.set('message', 'already_subscribed')
        return NextResponse.redirect(dashboardUrl)
      }

      // Set trial flags
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 14) // 14-day trial

      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          subscriptionStatus: 'trialing',
          subscriptionCurrentPeriodEnd: trialEndDate.toISOString(),
          trialEnd: trialEndDate.toISOString(),
          hasUsedTrial: true,
        },
      })

      // Redirect to dashboard with success message
      const dashboardUrl = new URL('/dashboard', request.url)
      dashboardUrl.searchParams.set('message', 'trial_started')
      return NextResponse.redirect(dashboardUrl)
    } else if (planId) {
      // Handle paid plan
      const userBilling = await getUserBilling(user.id)

      // Check if user has an active subscription
      if (userBilling.subscriptionStatus === 'active') {
        // User already has an active subscription - redirect to dashboard
        const dashboardUrl = new URL('/dashboard', request.url)
        dashboardUrl.searchParams.set('message', 'already_subscribed')
        return NextResponse.redirect(dashboardUrl)
      }

      try {
        const session = await createCheckoutSession({
          priceId: planId,
          userId: user.id,
          successUrl: next
            ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${next}`
            : undefined,
        })

        return NextResponse.redirect(session.url)
      } catch (error) {
        console.error('Error creating checkout session:', error)
        const errorUrl = new URL('/pricing', request.url)
        errorUrl.searchParams.set('error', 'checkout_failed')
        return NextResponse.redirect(errorUrl)
      }
    } else {
      // No plan or trial specified, redirect to pricing
      return NextResponse.redirect(new URL('/pricing', request.url))
    }
  } catch (error) {
    console.error('Error in start route:', error)
    return NextResponse.redirect(new URL('/pricing', request.url))
  }
}
