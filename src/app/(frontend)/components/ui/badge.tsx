import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'secondary'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        variant === 'default'
          ? 'bg-brand text-brand-foreground'
          : variant === 'outline'
            ? 'border border-border bg-background text-foreground'
            : 'bg-muted text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}
