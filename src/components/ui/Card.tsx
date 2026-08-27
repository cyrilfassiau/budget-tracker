import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Removes inner padding for cards that host a full-bleed list. */
  flush?: boolean
}

/**
 * The app's one container: a flat rounded surface. Depth comes from the fill
 * and the radius, never from a gradient — which the brief rules out outright.
 */
export function Card({ className, flush, children, ...props }: CardProps) {
  return (
    <section className={cn('card', !flush && 'p-4 sm:p-5', className)} {...props}>
      {children}
    </section>
  )
}

interface CardHeadProps {
  title: ReactNode
  meta?: ReactNode
  action?: ReactNode
  className?: string
}

export function CardHead({ title, meta, action, className }: CardHeadProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className="truncate text-[17px] font-extrabold tracking-[-0.02em] text-fg">{title}</h2>
        {meta ? <p className="mt-0.5 text-[13px] text-fg-muted">{meta}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
