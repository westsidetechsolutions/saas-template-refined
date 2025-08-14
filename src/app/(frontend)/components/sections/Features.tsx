// src/components/sections/Features.tsx
'use client'
import { SectionWrapper } from '../layout/section' // or "@/components/ui/SectionWrapper"
import { Calendar, Map, Clock, Shield, Zap, Workflow } from 'lucide-react'
import { m, makeStaggerContainer, useFadeInUpVariants, viewport, hoverLift } from '@/lib/motion'

const items = [
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    desc: 'Auto-arrange meetings based on locations, timezones, and preferences.',
  },
  {
    icon: Map,
    title: 'Location Insights',
    desc: 'See where teammates will be, avoid travel churn, and plan better.',
  },
  {
    icon: Clock,
    title: 'Real-time Updates',
    desc: 'Instantly reflect changes and notify everyone who’s impacted.',
  },
  {
    icon: Shield,
    title: 'Privacy-first',
    desc: 'Granular controls and encryption to keep location data protected.',
  },
  {
    icon: Zap,
    title: 'Fast by Default',
    desc: 'Optimized UI with keyboard shortcuts and offline-friendly UX.',
  },
  {
    icon: Workflow,
    title: 'Integrations',
    desc: 'Connect with calendars, maps, and HR systems you already use.',
  },
]

export default function Features(props: React.ComponentProps<typeof SectionWrapper>) {
  const item = useFadeInUpVariants({ distance: 14, duration: 0.28 })

  return (
    <SectionWrapper {...props}>
      <div className="text-center">
        <m.h2
          className="heading-2"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={useFadeInUpVariants({ distance: 8 })}
        >
          Powerful features, simple to use
        </m.h2>
        <m.p
          className="mt-4 body-lg mx-auto max-w-prose"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={useFadeInUpVariants({ distance: 6, delay: 0.05 })}
        >
          Everything you need to plan with confidence — without the busywork.
        </m.p>
      </div>

      <m.div
        className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        variants={makeStaggerContainer({ delayChildren: 0.05, staggerChildren: 0.08 })}
      >
        {items.map(({ icon: Icon, title, desc }) => (
          <m.div
            key={title}
            className="group rounded-lg border border-border bg-background p-6 shadow-soft transition-all"
            variants={item}
            {...hoverLift}
          >
            <Icon className="h-10 w-10 text-brand" />
            <h3 className="mt-5 text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-muted-foreground">{desc}</p>
          </m.div>
        ))}
      </m.div>
    </SectionWrapper>
  )
}
