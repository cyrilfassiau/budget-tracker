import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'

import { cn } from '@/lib/cn'
import { useMonthsWithEntries } from '@/hooks/useAppData'
import { useUIStore } from '@/store/useUIStore'
import { currentMonthKey, formatMonthLabel, shiftMonth } from '@/utils/dates'

/**
 * The month under inspection, shared by every surface that reads one. Months
 * holding entries are marked, so choosing one is reading rather than guessing.
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
    <div className={cn('pill inline-flex items-center bg-surface-2 p-1', className)}>
      <button
        type="button"
        onClick={() => setMonth(shiftMonth(month, -1))}
        aria-label="Previous month"
        className="flex size-8 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-surface-3 hover:text-fg"
      >
        <ChevronLeft className="size-4" />
      </button>

      <select
        value={month}
        onChange={(event) => setMonth(event.target.value)}
        aria-label="Month"
        className="h-8 min-w-[8.5rem] cursor-pointer appearance-none bg-transparent px-1 text-center text-[14px] font-bold text-fg"
      >
        {!options.includes(month) ? (
          <option value={month}>{formatMonthLabel(month)}</option>
        ) : null}
        {options.map((value) => (
          <option key={value} value={value}>
            {formatMonthLabel(value)}
            {withEntries.has(value) ? ' •' : ''}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setMonth(shiftMonth(month, 1))}
        disabled={month >= thisMonth}
        aria-label="Next month"
        className="flex size-8 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-surface-3 hover:text-fg disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}
