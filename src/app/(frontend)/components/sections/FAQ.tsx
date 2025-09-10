import { SectionWrapper } from '../layout/section'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    q: 'How does location-aware scheduling work?',
    a: 'We combine availability and location signals to propose optimal meeting times and places.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. We use encryption and give you granular controls over who sees what.',
  },
  { q: 'Can I try it for free?', a: 'Start on the Free plan — no credit card required.' },
  { q: 'Do you support SSO?', a: 'Yes — SAML/SSO is available on Enterprise.' },
]

export default function FAQ() {
  return (
    <SectionWrapper id="faq">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="heading-2">Frequently asked questions</h2>
      </div>
      <div className="mx-auto mt-10 max-w-3xl">
        <Accordion type="single" collapsible>
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </SectionWrapper>
  )
}
