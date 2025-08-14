import * as React from 'react'
import { cn } from '@/lib/utils'

type Space = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const GAP: Record<Space, string> = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-12',
}

const PADTOP: Record<Space, string> = {
  none: 'pt-0',
  xs: 'pt-2',
  sm: 'pt-3',
  md: 'pt-6',
  lg: 'pt-8',
  xl: 'pt-12',
}

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Vertical space between children */
  space?: Space
  /** Align items on cross-axis */
  align?: 'start' | 'center' | 'end' | 'stretch'
  /** Add soft dividers between items (uses tokens) */
  dividers?: boolean
}

export function Stack({
  className,
  children,
  space = 'md',
  align = 'start',
  dividers = false,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        'flex flex-col',
        GAP[space],
        align === 'start' && 'items-start',
        align === 'center' && 'items-center',
        align === 'end' && 'items-end',
        align === 'stretch' && 'items-stretch',
        dividers && cn('[&>*+*]:border-t [&>*+*]:border-border', `[&>*+*]:${PADTOP[space]}`),
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
