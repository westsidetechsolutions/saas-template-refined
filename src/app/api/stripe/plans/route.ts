import { NextResponse } from 'next/server'
import { fetchPlans } from '@/modules/stripe/plans'

export async function GET() {
  try {
    const plans = await fetchPlans()

    // Format the plans for the client
    const formattedPlans = plans.map((plan) => {
      const features = plan.metadata?.features?.split(',') || []
      const price = plan.default_price?.unit_amount || 0
      const isHighlight = plan.metadata?.highlight === 'true'

      return {
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        metadata: plan.metadata,
        default_price: plan.default_price,
        features,
        price,
        highlight: isHighlight,
      }
    })

    return NextResponse.json(formattedPlans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}
