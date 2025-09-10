'use client'
import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
    }

    return (
      <div
        className={cn(
          'h-4 w-4 shrink-0 rounded-sm border border-border ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
          'flex items-center justify-center',
          'cursor-pointer',
          checked ? 'bg-brand text-brand-foreground' : 'bg-background',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={() => {}} // Handled by onClick
          className="sr-only"
          disabled={disabled}
          {...props}
        />
      </div>
    )
  },
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
