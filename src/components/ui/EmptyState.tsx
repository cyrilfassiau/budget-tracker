import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
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
        size === 'md' ? 'gap-3 px-6 py-12' : 'gap-2 px-4 py-8',
        className,
      )}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className={cn(
            'flex items-center justify-center rounded-full bg-surface-2 text-fg-faint',
            size === 'md' ? 'size-14' : 'size-11',
          )}
        >
          {icon}
        </span>
      ) : null}

      <div className="max-w-xs">
        <p className={cn('font-extrabold tracking-[-0.02em] text-fg', size === 'md' ? 'text-[17px]' : 'text-[15px]')}>
          {title}
        </p>
        {description ? (
          <p className="mt-1 text-[14px] leading-relaxed text-fg-muted">{description}</p>
        ) : null}
      </div>

      {action ? <div className="mt-1.5 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  )
}
