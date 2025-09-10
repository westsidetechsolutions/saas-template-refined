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
    const headersList = await headers()
    const payload = await getPayload({ config })

    // Check if user is authenticated
    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
      console.log('❌ No authenticated user found for plan change')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { newPriceId } = await request.json()

    console.log('🔍 Plan change request:', {
      userId: user.id,
      userEmail: user.email,
      currentSubscriptionId: user.stripeSubscriptionId,
      newPriceId,
    })

    if (!newPriceId) {
      console.log('❌ No newPriceId provided')
      return NextResponse.json({ error: 'New price ID is required' }, { status: 400 })
    }

    if (!user.stripeSubscriptionId) {
      console.log('❌ No active subscription found for user:', user.id)
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    console.log(
      '🔄 Changing plan for subscription:',
      user.stripeSubscriptionId,
      'to price:',
      newPriceId,
    )

    // Retrieve current subscription to get the subscription item ID
    console.log('📋 Retrieving current subscription...')
    const currentSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
    console.log('📋 Current subscription:', {
      id: currentSubscription.id,
      status: currentSubscription.status,
      itemsCount: currentSubscription.items.data.length,
      firstItemId: currentSubscription.items.data[0]?.id,
    })

    if (!currentSubscription.items.data[0]) {
      console.log('❌ No subscription items found')
      return NextResponse.json({ error: 'No subscription items found' }, { status: 400 })
    }

    // Update the subscription with the new price
    console.log('🔄 Updating subscription...')
    const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      items: [
        {
          id: currentSubscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    })

    console.log('✅ Subscription updated successfully:', {
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: (subscription as any).current_period_end,
    })

    // Get the product details for the new price
    console.log('📋 Retrieving new price details...')
    const price = await stripe.prices.retrieve(newPriceId, {
      expand: ['product'],
    })

    const product = price.product as Stripe.Product
    console.log('📋 New price details:', {
      priceId: price.id,
      productName: product.name,
      unitAmount: price.unit_amount,
      currency: price.currency,
    })

    // Update the user's subscription information
    console.log('🔄 Updating user data...')

    // Prepare the update data
    const updateData: any = {
      subscriptionStatus: subscription.status,
      subscriptionPlan: product.name,
      planPriceId: newPriceId,
    }

    // Only update current_period_end if it's available
    if ((subscription as any).current_period_end) {
      updateData.subscriptionCurrentPeriodEnd = new Date(
        (subscription as any).current_period_end * 1000,
      ).toISOString()
      console.log('📅 Updated current_period_end:', updateData.subscriptionCurrentPeriodEnd)
    } else {
      console.log('⚠️ No current_period_end in subscription response, keeping existing value')
    }

    await payload.update({
      collection: 'users',
      id: user.id,
      data: updateData,
    })

    console.log('✅ Plan changed successfully:', subscription.id)

    return NextResponse.json({
      success: true,
      message: 'Plan changed successfully',
      newPlan: product.name,
      subscription: {
        status: subscription.status,
        currentPeriodEnd: (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000).toISOString()
          : undefined,
      },
    })
  } catch (error) {
    console.error('Error changing plan:', error)

    if (error instanceof Stripe.errors.StripeError) {
      if (error.code === 'resource_missing') {
        return NextResponse.json({ error: 'Subscription or price not found' }, { status: 404 })
      }
      if (error.code === 'invalid_request_error') {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to change plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
