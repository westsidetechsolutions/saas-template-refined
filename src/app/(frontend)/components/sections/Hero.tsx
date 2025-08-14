// src/components/sections/Hero.tsx
'use client'
import { SectionWrapper } from '../layout/section'
import { Button } from '@/components/ui/button'
import { m, useFadeInUpVariants, viewport, hoverPop } from '@/lib/motion'

export default function Hero() {
  const title = useFadeInUpVariants({ distance: 16, duration: 0.32 })
  const sub = useFadeInUpVariants({ distance: 10, duration: 0.3, delay: 0.05 })

  return (
    <SectionWrapper bg="gradient" padding="loose" fullWidth>
      <div className="mx-auto max-w-[1200px] px-6">
        <m.h1
          className="heading-1"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={title}
        >
          Location-aware scheduling, <span className="text-brand">simplified</span>.
        </m.h1>

        <m.p
          className="mt-6 body-lg max-w-prose"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={sub}
        >
          Schedule smarter by knowing where your team will be — automatically.
        </m.p>

        <div className="mt-8 flex flex-wrap gap-4">
          <m.div {...hoverPop}>
            <Button size="lg" className="shadow-soft hover:shadow-lift">
              Get Started
            </Button>
          </m.div>
          <m.div {...hoverPop}>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </m.div>
        </div>
      </div>
    </SectionWrapper>
  )
}
