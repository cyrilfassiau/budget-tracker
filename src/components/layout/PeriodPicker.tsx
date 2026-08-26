import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'

import { cn } from '@/lib/cn'
import { useMonthsWithEntries } from '@/hooks/useAppData'
import { useUIStore } from '@/store/useUIStore'
import { currentMonthKey, formatMonthLabel, shiftMonth } from '@/utils/dates'

/**
 * The period under inspection, shared by every surface that reads one.
 *
 * Months that hold entries are marked, so choosing a period is reading rather
 * than guessing — an unmarked month is a month you already know is empty.
 */
export function PeriodPicker({ className, range = 24 }: { className?: string; range?: number }) {
  const month = useUIStore((state) => state.selectedMonth)
  const setMonth = useUIStore((state) => state.setMonth)
  const withEntries = useMonthsWithEntries()
  const thisMonth = currentMonthKey()

  const options = useMemo(
    () => Array.from({ length: range }, (_, index) => shiftMonth(thisMonth, -index)),
    [range, thisMonth],
  )

  return (
    <div className={cn('flex items-stretch border border-rule bg-sheet', className)}>
      <button
        type="button"
        onClick={() => setMonth(shiftMonth(month, -1))}
        aria-label="Previous period"
        className="px-1.5 text-ink-3 transition-colors hover:bg-sheet-alt hover:text-ink"
      >
        <ChevronLeft className="size-4" />
      </button>

      <select
        value={month}
        onChange={(event) => setMonth(event.target.value)}
        aria-label="Period"
        className="h-8 min-w-[9.5rem] cursor-pointer appearance-none border-x border-rule bg-transparent px-2 text-center font-narrow text-[12px] font-semibold uppercase tracking-[0.07em] text-ink"
      >
        {!options.includes(month) ? (
          <option value={month}>{formatMonthLabel(month)}</option>
        ) : null}
        {options.map((value) => (
          <option key={value} value={value}>
            {formatMonthLabel(value)}
            {withEntries.has(value) ? ' ·' : ''}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setMonth(shiftMonth(month, 1))}
        disabled={month >= thisMonth}
        aria-label="Next period"
        className="px-1.5 text-ink-3 transition-colors hover:bg-sheet-alt hover:text-ink disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}
