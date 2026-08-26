import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface EmptyStateProps {
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
  size?: 'sm' | 'md'
}

/**
 * An unused page of the book: ruled, stamped, and honest about being empty.
 * No illustration, no icon in a tinted square.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'md' ? 'gap-2.5 px-6 py-12' : 'gap-2 px-4 py-8',
        className,
      )}
    >
      <p className="stamp text-ink-3">No entries</p>
      <p className="font-narrow text-[15px] font-semibold uppercase tracking-[0.06em] text-ink">
        {title}
      </p>
      {description ? (
        <p className="max-w-xs text-[13px] leading-relaxed text-ink-2">{description}</p>
      ) : null}
      {action ? <div className="mt-1.5 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  )
}
