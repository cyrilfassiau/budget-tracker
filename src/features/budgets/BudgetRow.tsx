import { AlertTriangle, Pencil, Trash2 } from 'lucide-react'

import { Badge, CategoryDot, ProgressBar } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useCurrencyFormat } from '@/store/useSettingsStore'
import type { BudgetProgress } from '@/utils/calculations'
import { formatMoney, formatPercent } from '@/utils/money'

interface BudgetRowProps {
  budget: BudgetProgress
  onEdit?: (budget: BudgetProgress) => void
  onDelete?: (budget: BudgetProgress) => void
  /** Dashboard shows a tighter row without the action buttons. */
  compact?: boolean
}

const STATUS_LABEL = {
  'on-track': 'On track',
  warning: 'Close to limit',
  over: 'Over budget',
} as const

/**
 * A category's budget for one month: how much is spent, how much is left, and
 * whether that is a problem yet.
 */
export function BudgetRow({ budget, onEdit, onDelete, compact = false }: BudgetRowProps) {
  const { currency, locale } = useCurrencyFormat()
  const isOver = budget.status === 'over'

  return (
    <li className={cn('group flex flex-col gap-2', compact ? 'py-2.5' : 'py-3.5')}>
      <div className="flex items-center gap-3">
        <CategoryDot color={budget.color} icon={budget.icon} size={compact ? 'sm' : 'md'} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-fg">{budget.name}</p>
            {isOver ? (
              <Badge tone="expense" icon={<AlertTriangle className="size-3" />}>
                Over
              </Badge>
            ) : budget.status === 'warning' ? (
              <Badge tone="warning">{formatPercent(budget.ratio, locale)}</Badge>
            ) : null}
          </div>
          {!compact ? (
            <p className="mt-0.5 text-xs text-fg-subtle">
              {isOver
                ? `${formatMoney(Math.abs(budget.remaining), currency, locale)} over the limit`
                : `${formatMoney(budget.remaining, currency, locale)} left`}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          <p className="tabular text-sm font-semibold text-fg">
            {formatMoney(budget.spent, currency, locale, { maximumFractionDigits: 0 })}
            <span className="font-normal text-fg-subtle">
              {' / '}
              {formatMoney(budget.limit, currency, locale, { maximumFractionDigits: 0 })}
            </span>
          </p>
          {compact ? (
            <p className="text-[11px] text-fg-subtle">{STATUS_LABEL[budget.status]}</p>
          ) : null}
        </div>

        {!compact && onEdit && onDelete ? (
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(budget)}
              aria-label={`Edit budget for ${budget.name}`}
              className="rounded-lg p-1.5 text-fg-subtle transition-colors hover:bg-bg-subtle hover:text-fg"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(budget)}
              aria-label={`Remove budget for ${budget.name}`}
              className="rounded-lg p-1.5 text-fg-subtle transition-colors hover:bg-expense-soft hover:text-expense"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ) : null}
      </div>

      <ProgressBar
        value={budget.ratio}
        label={`${budget.name} budget`}
        color={budget.color}
        tone={budget.status === 'over' ? 'over' : budget.status === 'warning' ? 'warning' : 'default'}
        size={compact ? 'sm' : 'md'}
      />
    </li>
  )
}
