import { NextRequest, NextResponse } from 'next/server'
import { fetchPlans } from '../../../modules/stripe/plans'
import { createCheckoutSession } from '../../../lib/stripe/createCheckoutSession'

export async function GET() {
  try {
    const plans = await fetchPlans()
    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const params = await request.json()
    console.log('Creating checkout session with params:', params)

    const session = await createCheckoutSession(params)
    console.log('Checkout session created successfully:', session.sessionId)

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
