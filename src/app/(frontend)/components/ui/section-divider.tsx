// src/components/ui/SectionDivider.tsx
import { cn } from '@/lib/utils'

export function SectionDivider({ className }: { className?: string }) {
  return (
    <div className={cn('my-16', className)}>
      <div className="relative h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    </div>
  )
}
