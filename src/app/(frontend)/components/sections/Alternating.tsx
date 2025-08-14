import { SectionWrapper } from '../layout/section'
import { Button } from '@/components/ui/button'

export default function Alternating() {
  return (
    <SectionWrapper bg="muted">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <h2 className="heading-2">Plan around real-world movement</h2>
          <p className="mt-4 body-lg max-w-prose">
            Your schedule adapts as people move. Avoid cross-town meetings, commute spikes, and
            last-minute location clashes.
          </p>
          <div className="mt-8 flex gap-3">
            <Button>Try it free</Button>
            <Button variant="outline">See how it works</Button>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background p-6 shadow-soft">
          <div className="aspect-video w-full rounded-lg bg-muted" />
          <p className="mt-3 text-sm text-muted-foreground">
            Placeholder for a map or product shot.
          </p>
        </div>
      </div>
    </SectionWrapper>
  )
}
