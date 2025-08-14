import * as React from 'react'
import { cn } from '@/lib/utils'

type Space = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const GAP: Record<Space, string> = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

export interface ClusterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Horizontal gap between items (wrap-safe) */
  space?: Space
  /** Main-axis distribution */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  /** Cross-axis alignment */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  /** Allow wrapping (recommended for buttons/links) */
  wrap?: boolean
}

export function Cluster({
  className,
  children,
  space = 'md',
  justify = 'start',
  align = 'center',
  wrap = true,
  ...props
}: ClusterProps) {
  return (
    <div
      className={cn(
        'flex',
        wrap ? 'flex-wrap' : 'flex-nowrap',
        GAP[space],
        justify === 'start' && 'justify-start',
        justify === 'center' && 'justify-center',
        justify === 'end' && 'justify-end',
        justify === 'between' && 'justify-between',
        justify === 'around' && 'justify-around',
        justify === 'evenly' && 'justify-evenly',
        align === 'start' && 'items-start',
        align === 'center' && 'items-center',
        align === 'end' && 'items-end',
        align === 'stretch' && 'items-stretch',
        align === 'baseline' && 'items-baseline',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
