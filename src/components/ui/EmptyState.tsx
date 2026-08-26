import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
  /** Compact variant for empty states inside a small card. */
  size?: 'sm' | 'md'
}

export function EmptyState({
  icon,
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
        size === 'md' ? 'gap-3 px-6 py-14' : 'gap-2 px-4 py-8',
        className,
      )}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className={cn(
            'flex items-center justify-center rounded-2xl bg-bg-subtle text-fg-subtle',
            size === 'md' ? 'size-12' : 'size-10',
          )}
        >
          {icon}
        </span>
      ) : null}

      <div className="max-w-sm">
        <p className={cn('font-semibold text-fg', size === 'md' ? 'text-[15px]' : 'text-sm')}>
          {title}
        </p>
        {description ? (
          <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{description}</p>
        ) : null}
      </div>

      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}
