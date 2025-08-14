import { SectionWrapper } from '../layout/section'
import { Button } from '@/components/ui/button'

export default function FinalCTA() {
  return (
    <SectionWrapper fullWidth>
      <div className="mx-auto max-w-[1200px] rounded-2xl bg-brand px-8 py-16 text-center text-brand-foreground shadow-lift">
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
          Ready to schedule smarter?
        </h2>
        <p className="mx-auto mt-4 max-w-prose opacity-90">
          Start for free and see how easy it is to keep your team in sync.
        </p>
        <div className="mt-8 flex justify-center">
          <Button size="lg" variant="secondary">
            Get Started
          </Button>
        </div>
      </div>
    </SectionWrapper>
  )
}
