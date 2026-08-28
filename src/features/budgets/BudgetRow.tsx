import { Pencil, Trash2 } from 'lucide-react'

import { Amount, CategoryAvatar, PaceBar } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useCurrencyFormat } from '@/store/useSettingsStore'
import type { BudgetProgress } from '@/utils/calculations'
import { formatMoney, formatPercent } from '@/utils/money'

interface BudgetRowProps {
  budget: BudgetProgress
  onEdit?: (budget: BudgetProgress) => void
  onDelete?: (budget: BudgetProgress) => void
  compact?: boolean
}

function verdict(budget: BudgetProgress, currency: string, locale: string): string {
  if (budget.limit === 0) return 'No limit set'
  if (budget.status === 'over') {
    return `${formatMoney(Math.abs(budget.remaining), currency, locale)} over`
  }
  if (budget.pace >= 1) {
    return budget.spent === 0
      ? 'Nothing spent all month'
      : `${formatMoney(budget.remaining, currency, locale)} left over`
  }
  if (budget.spent === 0 && budget.pace >= 0.5) {
    return `Nothing spent yet, ${formatPercent(budget.pace, locale)} of the month gone`
  }
  if (budget.aheadOfSchedule) {
    return `${formatMoney(budget.paceDelta, currency, locale)} ahead of pace`
  }
  return `${formatMoney(budget.remaining, currency, locale)} left`
}

export function BudgetRow({ budget, onEdit, onDelete, compact = false }: BudgetRowProps) {
  const { currency, locale } = useCurrencyFormat()
  const isOver = budget.status === 'over'
  const unpaidLate = budget.limit > 0 && budget.spent === 0 && budget.pace >= 0.5

  return (
    <li className={cn('group flex flex-col gap-2.5', compact ? 'py-2.5' : 'py-3')}>
      <div className="flex items-center gap-3">
        <CategoryAvatar color={budget.color} icon={budget.icon} size={compact ? 'sm' : 'md'} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-fg">{budget.name}</p>
          <p
            className={cn(
              'mt-0.5 truncate text-[13px]',
              isOver ? 'font-semibold text-negative' : unpaidLate ? 'text-fg' : 'text-fg-muted',
            )}
          >
            {verdict(budget, currency, locale)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[15px] font-extrabold text-fg">
            <Amount value={budget.spent} plain whole />
          </p>
          <p className="text-[12px] font-semibold text-fg-faint">
            of <Amount value={budget.limit} plain whole />
          </p>
        </div>
        {!compact && onEdit && onDelete ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(budget)}
              aria-label={`Change the limit for ${budget.name}`}
              className="tap flex items-center justify-center rounded-full text-fg-faint transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(budget)}
              aria-label={`Remove the limit for ${budget.name}`}
              className="tap flex items-center justify-center rounded-full text-fg-faint transition-colors hover:bg-negative-soft hover:text-negative"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ) : null}
      </div>
      <PaceBar
        value={budget.ratio}
        pace={budget.pace}
        label={`${budget.name} budget`}
        color={budget.color}
        over={isOver}
        aheadOfSchedule={budget.aheadOfSchedule}
      />
    </li>
  )
}
