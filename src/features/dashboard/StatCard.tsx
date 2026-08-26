import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card } from '@/components/ui'
import { cn } from '@/lib/cn'
import { formatPercent } from '@/utils/money'

interface StatCardProps {
  label: string
  value: string
  icon: ReactNode
  tone?: 'income' | 'expense' | 'accent' | 'neutral'
  /** Period-over-period change as a ratio; `null` hides the delta chip. */
  change?: number | null
  /** Whether a rise is good news — flips the delta colour for expenses. */
  higherIsBetter?: boolean
  hint?: ReactNode
}

const TONE_STYLES = {
  income: 'bg-income-soft text-income',
  expense: 'bg-expense-soft text-expense',
  accent: 'bg-accent-soft text-accent',
  neutral: 'bg-bg-subtle text-fg-muted',
}

export function StatCard({
  label,
  value,
  icon,
  tone = 'neutral',
  change,
  higherIsBetter = true,
  hint,
}: StatCardProps) {
  const hasChange = change !== null && change !== undefined && Number.isFinite(change)
  const isUp = hasChange && change > 0
  const isFlat = hasChange && change === 0
  const isGood = isUp === higherIsBetter

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[13px] font-medium text-fg-muted">{label}</span>
        <span
          aria-hidden="true"
          className={cn('flex size-8 items-center justify-center rounded-xl', TONE_STYLES[tone])}
        >
          {icon}
        </span>
      </div>

      <p className="tabular text-2xl font-semibold tracking-tight text-fg">{value}</p>

      <div className="flex min-h-5 items-center gap-2">
        {hasChange ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
              isFlat
                ? 'bg-bg-subtle text-fg-muted'
                : isGood
                  ? 'bg-income-soft text-income'
                  : 'bg-expense-soft text-expense',
            )}
          >
            {isFlat ? (
              <Minus className="size-3" />
            ) : isUp ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {formatPercent(Math.abs(change), undefined)}
          </span>
        ) : null}
        {hint ? <span className="truncate text-[11px] text-fg-subtle">{hint}</span> : null}
      </div>
    </Card>
  )
}
