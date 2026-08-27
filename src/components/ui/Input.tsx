import type { InputHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { controlClasses } from './controlClasses'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leading?: ReactNode
  trailing?: ReactNode
}

export function Input({ className, leading, trailing, ...props }: InputProps) {
  if (!leading && !trailing) {
    return <input className={cn(controlClasses, 'h-12', className)} {...props} />
  }

  return (
    <div className="relative flex items-center">
      {leading ? (
        <span className="pointer-events-none absolute left-3.5 flex items-center text-fg-faint">
          {leading}
        </span>
      ) : null}
      <input
        className={cn(controlClasses, 'h-12', leading && 'pl-10', trailing && 'pr-10', className)}
        {...props}
      />
      {trailing ? (
        <span className="absolute right-3.5 flex items-center text-fg-faint">{trailing}</span>
      ) : null}
    </div>
  )
}
