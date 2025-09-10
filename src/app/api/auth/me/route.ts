import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET() {
  try {
    const headersList = await headers()
    const payload = await getPayload({ config })

    console.log('🔍 API: Checking authentication...')
    const { user } = await payload.auth({ headers: headersList })
    console.log(
      '👤 API: User found:',
      user ? { id: user.id, email: user.email, role: user.role } : 'No user',
    )

    if (user) {
      console.log('🔍 API: Full user data:', {
        id: user.id,
        email: user.email,
        role: user.role,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        planPriceId: user.planPriceId,
        subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
      })

      return NextResponse.json({
        authenticated: true,
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        _verified: user._verified,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        planPriceId: user.planPriceId,
        subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
      })
    } else {
      return NextResponse.json({
        authenticated: false,
        user: null,
      })
    }
  } catch (error) {
    console.error('❌ API: Authentication error:', error)
    return NextResponse.json(
      {
        authenticated: false,
        error: 'Authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 401 },
    )
  }
}
