import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 User status API called')
    const payload = await getPayload({ config })

    // Get the user from the auth token
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      console.log('❌ No authenticated user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('👤 User found:', {
      id: user.id,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
    })

    // Get global settings
    const globalSettings = await payload.find({
      collection: 'global-settings',
      where: {
        isActive: {
          equals: true,
        },
      },
      limit: 1,
    })

    console.log('⚙️ Global settings found:', globalSettings.docs.length)
    const pricingRedirectUrl = globalSettings.docs[0]?.pricingRedirectUrl || '/#pricing'
    console.log('📍 Pricing redirect URL:', pricingRedirectUrl)

    // Check if user has an active subscription
    // A user is considered to have an active subscription if:
    // 1. subscriptionStatus is 'active' or 'trialing'
    // 2. OR if subscriptionStatus is 'canceled' but still within current period
    const now = new Date()
    const currentPeriodEnd = user.subscriptionCurrentPeriodEnd
      ? new Date(user.subscriptionCurrentPeriodEnd)
      : null

    const isActive = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing'
    const isCanceledButActive =
      user.subscriptionStatus === 'canceled' && currentPeriodEnd && currentPeriodEnd > now

    const hasActiveSubscription = isActive || isCanceledButActive

    console.log('📊 Subscription check details:', {
      userId: user.id,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
      currentPeriodEnd: currentPeriodEnd,
      now: now,
      isActive,
      isCanceledButActive,
      hasActiveSubscription,
    })

    const response = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
        lastPaymentDate: user.lastPaymentDate,
        hasActiveSubscription,
      },
      globalSettings: {
        pricingRedirectUrl,
      },
    }

    console.log('📤 Sending response:', response)
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('💥 User status error:', error)
    return NextResponse.json({ error: 'Failed to get user status' }, { status: 500 })
  }
}
