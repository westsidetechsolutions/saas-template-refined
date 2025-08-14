import { SectionWrapper } from '../layout/section'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    desc: 'For individuals and pilots',
    features: ['Basic scheduling', 'Email support', 'Up to 5 members'],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29/mo',
    desc: 'For growing teams',
    features: ['All Free features', 'Location insights', 'Unlimited members'],
    cta: 'Upgrade',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Talk to us',
    desc: 'For organizations with advanced needs',
    features: ['All Pro features', 'SAML/SSO', 'Custom integrations'],
    cta: 'Contact Sales',
    highlight: false,
  },
]

export default function Pricing() {
  return (
    <SectionWrapper bg="muted">
      <div className="text-center">
        <h2 className="heading-2">Simple, transparent pricing</h2>
        <p className="mt-4 body-lg mx-auto max-w-prose">Start free. Scale when you’re ready.</p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {tiers.map((t) => (
          <Card key={t.name} className={`p-6 ${t.highlight ? 'border-brand shadow-lift' : ''}`}>
            <div className="flex items-baseline justify-between">
              <div className="text-lg font-semibold">{t.name}</div>
              <div className="text-2xl font-bold">{t.price}</div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>

            <ul className="mt-6 space-y-2 text-sm">
              {t.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>

            <Button className="mt-6 w-full">{t.cta}</Button>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  )
}
