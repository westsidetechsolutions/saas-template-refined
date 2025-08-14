// src/components/ui/EdgeFade.tsx
import { cn } from '@/lib/utils'

export function EdgeFade({
  position = 'bottom',
  className,
}: {
  position?: 'top' | 'bottom'
  className?: string
}) {
  const common = 'pointer-events-none absolute inset-x-0'
  const top = 'top-0 h-12 bg-gradient-to-b from-background/90 via-background/60 to-transparent'
  const bottom =
    'bottom-0 h-12 bg-gradient-to-t from-background/90 via-background/60 to-transparent'
  return <div aria-hidden className={cn(common, position === 'top' ? top : bottom, className)} />
}
