import type { InputHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { controlClasses } from './controlClasses'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Rendered inside the field on the left (currency symbol, search icon). */
  leading?: ReactNode
  trailing?: ReactNode
}

export function Input({ className, leading, trailing, ...props }: InputProps) {
  if (!leading && !trailing) {
    return <input className={cn(controlClasses, 'h-10', className)} {...props} />
  }

  return (
    <div className="relative flex items-center">
      {leading ? (
        <span className="pointer-events-none absolute left-3 flex items-center text-fg-subtle">
          {leading}
        </span>
      ) : null}
      <input
        className={cn(controlClasses, 'h-10', leading && 'pl-9', trailing && 'pr-9', className)}
        {...props}
      />
      {trailing ? (
        <span className="absolute right-3 flex items-center text-fg-subtle">{trailing}</span>
      ) : null}
    </div>
  )
}
