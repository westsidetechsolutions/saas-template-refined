import { SectionWrapper } from '../layout/section'

export default function SocialProof() {
  const logos = ['Acme', 'Bolt', 'Lovable', 'Vercel', 'Stripe', 'Shopify']

  return (
    <SectionWrapper bg="muted" padding="tight">
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">Trusted by teams worldwide</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 opacity-80">
          {logos.map((name) => (
            <div key={name} className="text-sm text-muted-foreground">
              {name}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
