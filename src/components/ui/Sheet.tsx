import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

/**
 * A sheet of the book. Replaces the card: square corners, a single hairline
 * rule, and the stock's own colour — no shadow, no radius, no nesting.
 */
export function Sheet({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn('border border-rule bg-sheet', className)}
      {...props}
    >
      {children}
    </section>
  )
}

interface SheetHeadProps {
  title: ReactNode
  meta?: ReactNode
  action?: ReactNode
  className?: string
}

/**
 * The printed head of a sheet: title on the left, action on the right, ruled
 * off from the body below it.
 */
export function SheetHead({ title, meta, action, className }: SheetHeadProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1',
        'border-b border-rule px-4 py-2.5 sm:px-5',
        className,
      )}
    >
      <h2 className="font-narrow text-[13px] font-semibold uppercase tracking-[0.08em] text-ink">
        {title}
      </h2>
      {meta ? <p className="stamp text-ink-3">{meta}</p> : null}
      {action ? <div className="ml-auto">{action}</div> : null}
    </div>
  )
}

/** A ruled row inside a sheet. The app's fundamental unit of structure. */
export function Rule({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('h-px bg-rule', className)} />
}
