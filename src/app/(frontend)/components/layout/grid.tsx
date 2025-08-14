import * as React from 'react'
import { cn } from '@/lib/utils'

type Space = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const GAP: Record<Space, string> = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-12',
}

type Cols = number | { base?: number; sm?: number; md?: number; lg?: number; xl?: number }

function colsToClasses(cols: Cols | undefined) {
  if (!cols) return 'grid-cols-1'
  if (typeof cols === 'number') return `grid-cols-${cols}`
  const parts: string[] = []
  if (cols.base) parts.push(`grid-cols-${cols.base}`)
  if (cols.sm) parts.push(`sm:grid-cols-${cols.sm}`)
  if (cols.md) parts.push(`md:grid-cols-${cols.md}`)
  if (cols.lg) parts.push(`lg:grid-cols-${cols.lg}`)
  if (cols.xl) parts.push(`xl:grid-cols-${cols.xl}`)
  return parts.join(' ')
}

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Columns, responsive-friendly */
  cols?: Cols
  /** Gutter size */
  gap?: Space
  /** Equal-height cards often like align-start to avoid stretching */
  align?: 'start' | 'center' | 'end' | 'stretch'
}

export function Grid({
  className,
  children,
  cols = { base: 1, sm: 2, lg: 3 },
  gap = 'md',
  align = 'start',
  ...props
}: GridProps) {
  return (
    <div
      className={cn(
        'grid',
        colsToClasses(cols),
        GAP[gap],
        align === 'start' && 'items-start',
        align === 'center' && 'items-center',
        align === 'end' && 'items-end',
        align === 'stretch' && 'items-stretch',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
