import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type BadgeTone = 'neutral' | 'income' | 'expense' | 'warning' | 'accent'

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-bg-subtle text-fg-muted',
  income: 'bg-income-soft text-income',
  expense: 'bg-expense-soft text-expense',
  warning: 'bg-warning-soft text-warning',
  accent: 'bg-accent-soft text-accent',
}

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
  icon?: ReactNode
}

export function Badge({ tone = 'neutral', children, className, icon }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
        'text-[11px] font-semibold tracking-wide whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
