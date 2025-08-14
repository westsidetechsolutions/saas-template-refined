import { SectionWrapper } from '../layout/section'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const quotes = [
  {
    name: 'Alex Rivera',
    role: 'Ops Lead, Northwind',
    quote: 'Cut our scheduling time in half and made in-office days actually coordinated.',
  },
  {
    name: 'Jamie Huang',
    role: 'PM, Contoso',
    quote: 'Finally, a calendar that understands geography. The team loves it.',
  },
  {
    name: 'Priya Shah',
    role: 'Founder, Orbit',
    quote: 'We look and feel more professional to clients because logistics just work.',
  },
]

export default function Testimonials() {
  return (
    <SectionWrapper>
      <div className="text-center">
        <h2 className="heading-2">Loved by teams who value time</h2>
        <p className="mt-4 body-lg mx-auto max-w-prose">
          Here’s what customers say after switching.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {quotes.map((q) => (
          <figure
            key={q.name}
            className="rounded-lg border border-border bg-background p-6 shadow-soft transition-all hover:shadow-lift"
          >
            <blockquote className="text-base">“{q.quote}”</blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {q.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium">{q.name}</div>
                <div className="text-muted-foreground">{q.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </SectionWrapper>
  )
}
