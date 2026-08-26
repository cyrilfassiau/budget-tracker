import type { InputHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { controlClasses } from './controlClasses'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leading?: ReactNode
  trailing?: ReactNode
}

export function Input({ className, leading, trailing, ...props }: InputProps) {
  if (!leading && !trailing) {
    return <input className={cn(controlClasses, 'h-9', className)} {...props} />
  }

  return (
    <div className="relative flex items-center">
      {leading ? (
        <span className="pointer-events-none absolute left-2.5 flex items-center text-ink-3">
          {leading}
        </span>
      ) : null}
      <input
        className={cn(controlClasses, 'h-9', leading && 'pl-7', trailing && 'pr-8', className)}
        {...props}
      />
      {trailing ? (
        <span className="absolute right-2.5 flex items-center text-ink-3">{trailing}</span>
      ) : null}
    </div>
  )
}
