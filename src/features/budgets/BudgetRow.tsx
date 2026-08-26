import { Pencil, Trash2 } from 'lucide-react'

import { Amount, CategoryMark, PaceBar } from '@/components/ui'
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

/**
 * How the money is going against how the month is going.
 *
 * The verdict is written in words, not inferred from a colour: "ahead of
 * schedule" is a judgement the reader should not have to compute from a bar.
 */
function verdict(budget: BudgetProgress, currency: string, locale: string): string {
  if (budget.limit === 0) return 'No limit set'
  if (budget.status === 'over') {
    return `${formatMoney(Math.abs(budget.remaining), currency, locale)} over the limit`
  }
  if (budget.pace >= 1) {
    return `${formatMoney(budget.remaining, currency, locale)} unspent`
  }
  // "Ahead"/"behind schedule" reads as praise and warning the wrong way round
  // for spending, where going slower than the month is the good outcome.
  if (budget.aheadOfSchedule) {
    return `${formatMoney(budget.paceDelta, currency, locale)} ahead of pace`
  }
  return `${formatMoney(Math.abs(budget.paceDelta), currency, locale)} within pace`
}

export function BudgetRow({ budget, onEdit, onDelete, compact = false }: BudgetRowProps) {
  const { currency, locale } = useCurrencyFormat()
  const isOver = budget.status === 'over'

  return (
    <li className={cn('group border-t border-rule px-4 sm:px-5', compact ? 'py-2' : 'py-2.5')}>
      <div className="flex items-baseline gap-2">
        <CategoryMark icon={budget.icon} size="sm" className="self-center" />

        <p className="min-w-0 flex-1 truncate text-[13px] text-ink">{budget.name}</p>

        <p className="whitespace-nowrap text-[13px] text-ink">
          <Amount value={budget.spent} plain whole />
          <span className="text-ink-3">
            {' of '}
            <Amount value={budget.limit} plain whole />
          </span>
        </p>

        {!compact && onEdit && onDelete ? (
          <div className="ml-1 flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => onEdit(budget)}
              aria-label={`Change the limit for ${budget.name}`}
              className="p-1 text-ink-3 transition-colors hover:bg-sheet-alt hover:text-ink"
            >
              <Pencil className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(budget)}
              aria-label={`Remove the limit for ${budget.name}`}
              className="p-1 text-ink-3 transition-colors hover:bg-red-tint hover:text-red"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ) : null}
      </div>

      <PaceBar
        className="mt-1.5"
        value={budget.ratio}
        pace={budget.pace}
        label={`${budget.name} budget`}
        over={isOver}
        aheadOfSchedule={budget.aheadOfSchedule}
      />

      <p
        className={cn(
          'mt-1 flex items-baseline justify-between gap-2 text-[11px]',
          isOver ? 'text-red' : 'text-ink-3',
        )}
      >
        <span>{verdict(budget, currency, locale)}</span>
        <span className="figure shrink-0">
          {formatPercent(budget.ratio, locale)} spent · {formatPercent(budget.pace, locale)} elapsed
        </span>
      </p>
    </li>
  )
}
