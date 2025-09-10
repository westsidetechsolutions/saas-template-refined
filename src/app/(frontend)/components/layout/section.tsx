import * as React from 'react'
import { cn } from '@/lib/utils'
import { EdgeFade } from '../ui/edgeFade'

export interface SectionWrapperProps {
  children: React.ReactNode
  className?: string

  /** HTML id attribute for the section */
  id?: string

  /** When true, content spans full width (no container) */
  fullWidth?: boolean

  /** Background style */
  bg?: 'background' | 'muted' | 'gradient' | 'grid'

  /** Vertical padding scale */
  padding?: 'tight' | 'default' | 'loose'

  /** Soft gradient fades at the edges to separate sections */
  edgeTop?: boolean
  edgeBottom?: boolean
}

export function SectionWrapper({
  children,
  className,
  id,
  fullWidth = false,
  bg = 'background',
  padding = 'default',
  edgeTop = false,
  edgeBottom = false,
}: SectionWrapperProps) {
  const bgClass =
    bg === 'muted'
      ? 'bg-muted'
      : bg === 'gradient'
        ? 'bg-background bg-radial-brand'
        : bg === 'grid'
          ? 'bg-background bg-grid-muted'
          : 'bg-background'

  const paddingClass =
    padding === 'tight'
      ? 'py-16 md:py-20'
      : padding === 'loose'
        ? 'py-28 md:py-36'
        : 'py-20 md:py-28'

  return (
    <section id={id} className={cn('relative', bgClass, paddingClass, className)}>
      {edgeTop && <EdgeFade position="top" />}
      {fullWidth ? children : <div className="mx-auto max-w-[1200px] px-6">{children}</div>}
      {edgeBottom && <EdgeFade position="bottom" />}
    </section>
  )
}
