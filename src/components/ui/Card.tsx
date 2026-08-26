import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Removes inner padding for cards that host their own table/list. */
  flush?: boolean
}

export function Card({ className, flush, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border-base bg-card',
        'shadow-[0_1px_2px_rgb(16_21_31/0.04),0_8px_24px_-12px_rgb(16_21_31/0.10)]',
        'dark:shadow-[0_1px_2px_rgb(0_0_0/0.4)]',
        !flush && 'p-5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h2 className="truncate text-[15px] font-semibold tracking-tight text-fg">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-[13px] text-fg-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
