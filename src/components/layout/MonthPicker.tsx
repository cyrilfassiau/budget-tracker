import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'

import { cn } from '@/lib/cn'
import { useUIStore } from '@/store/useUIStore'
import { currentMonthKey, formatMonthLabel, shiftMonth } from '@/utils/dates'

interface MonthPickerProps {
  className?: string
  /** Number of past months offered in the dropdown. */
  range?: number
}

/**
 * Shared month selector. The dashboard and budgets pages both read
 * `selectedMonth` from the UI store, so changing it here moves both.
 */
export function MonthPicker({ className, range = 24 }: MonthPickerProps) {
  const month = useUIStore((state) => state.selectedMonth)
  const setMonth = useUIStore((state) => state.setMonth)
  const thisMonth = currentMonthKey()

  const options = useMemo(
    () =>
      Array.from({ length: range }, (_, index) => shiftMonth(thisMonth, -index)).sort((a, b) =>
        b.localeCompare(a),
      ),
    [range, thisMonth],
  )

  const atLatest = month >= thisMonth

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-xl border border-border-base bg-card p-0.5',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setMonth(shiftMonth(month, -1))}
        aria-label="Previous month"
        className="rounded-lg p-1.5 text-fg-muted transition-colors hover:bg-card-muted hover:text-fg"
      >
        <ChevronLeft className="size-4" />
      </button>

      <div className="relative">
        <select
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          aria-label="Select month"
          className="h-8 w-full min-w-[8.5rem] cursor-pointer appearance-none rounded-lg bg-transparent px-2 text-center text-[13px] font-semibold text-fg"
        >
          {/* A month outside the range (deep history) stays selectable. */}
          {!options.includes(month) ? (
            <option value={month}>{formatMonthLabel(month)}</option>
          ) : null}
          {options.map((value) => (
            <option key={value} value={value}>
              {formatMonthLabel(value)}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => setMonth(shiftMonth(month, 1))}
        disabled={atLatest}
        aria-label="Next month"
        className="rounded-lg p-1.5 text-fg-muted transition-colors hover:bg-card-muted hover:text-fg disabled:pointer-events-none disabled:opacity-35"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}
