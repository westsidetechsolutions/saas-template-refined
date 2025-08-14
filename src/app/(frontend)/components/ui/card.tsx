import * as React from 'react'
import { cn } from '@/lib/utils'

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-background p-6 shadow-soft transition-all hover:shadow-lift',
        className,
      )}
      {...props}
    />
  )
}

export { Card }
