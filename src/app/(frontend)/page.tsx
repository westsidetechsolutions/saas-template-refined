// src/app/(frontend)/page.tsx
import { Button } from '@/components/ui/button'
import {
  Hero,
  SocialProof,
  Features,
  Alternating,
  Testimonials,
  Pricing,
  FAQ,
  FinalCTA,
} from './components/sections'

export default function HomePage() {
  return (
    <>
      <Hero />
      <SocialProof />
      <Features bg="background" />
      <Alternating />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
    </>
  )
}
