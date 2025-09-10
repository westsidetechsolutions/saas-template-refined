import { SectionWrapper } from '../layout/section'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fetchPlans } from '@/modules/stripe/plans'
import { Check } from 'lucide-react'
import Link from 'next/link'

interface PricingPlan {
  id: string
  name: string
  description: string
  metadata: Record<string, string>
  default_price: {
    id?: string
    unit_amount: number
    currency: string
    recurring?: {
      interval: string
    }
  }
  features: string[]
  price: number
  highlight: boolean
}

// Fallback plans in case Stripe is not available
const fallbackPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'For individuals and pilots',
    metadata: { features: 'Basic scheduling,Email support,Up to 5 members' },
    default_price: { unit_amount: 0, currency: 'usd' },
    features: ['Basic scheduling', 'Email support', 'Up to 5 members'],
    price: 0,
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing teams',
    metadata: { features: 'All Free features,Location insights,Unlimited members' },
    default_price: { unit_amount: 2900, currency: 'usd', recurring: { interval: 'month' } },
    features: ['All Free features', 'Location insights', 'Unlimited members'],
    price: 2900,
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For organizations with advanced needs',
    metadata: { features: 'All Pro features,SAML/SSO,Custom integrations' },
    default_price: { unit_amount: 0, currency: 'usd' },
    features: ['All Pro features', 'SAML/SSO', 'Custom integrations'],
    price: 0,
    highlight: false,
  },
]

export default async function Pricing() {
  let plans: PricingPlan[] = fallbackPlans

  try {
    // Fetch plans from Stripe
    const stripePlans = await fetchPlans()

    // Transform Stripe plans to our format
    plans = stripePlans.map((plan) => {
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
  } catch (error) {
    console.error('Error fetching Stripe plans:', error)
    // Use fallback plans if Stripe fetch fails
  }

  const formatPrice = (price: number, currency: string = 'usd') => {
    if (price === 0) {
      return 'Free'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price / 100)
  }

  const getActionUrl = (plan: PricingPlan) => {
    if (plan.price === 0) {
      // Free plan - start trial
      return '/start?trial=1'
    } else {
      // Paid plan - use plan ID
      return `/start?planId=${plan.default_price?.id || plan.id}`
    }
  }

  const getActionText = (plan: PricingPlan) => {
    if (plan.price === 0) {
      return 'Start Free Trial'
    } else {
      return 'Get Started'
    }
  }

  return (
    <SectionWrapper id="pricing" bg="muted">
      <div className="text-center">
        <h2 className="heading-2">Simple, transparent pricing</h2>
        <p className="mt-4 body-lg mx-auto max-w-prose">Start free. Scale when you're ready.</p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`p-6 relative ${plan.highlight ? 'border-brand shadow-lift' : ''}`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-brand text-brand-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            {/* Plan Name */}
            <div className="text-xl font-semibold text-foreground mb-2">{plan.name}</div>

            {/* Price Section */}
            <div className="mb-4">
              <div className="text-3xl font-bold text-foreground">
                {formatPrice(plan.price, plan.default_price?.currency)}
                {plan.price > 0 && plan.default_price?.recurring?.interval && (
                  <span className="text-base font-normal text-muted-foreground">
                    /{plan.default_price.recurring.interval}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

            {/* Features List */}
            <ul className="space-y-3 text-sm mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-4 w-4 text-brand mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button asChild className="w-full" variant={plan.highlight ? 'default' : 'outline'}>
              <Link href={getActionUrl(plan)}>{getActionText(plan)}</Link>
            </Button>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  )
}
