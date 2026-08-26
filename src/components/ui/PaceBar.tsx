import { cn } from '@/lib/cn'
import { formatPercent } from '@/utils/money'

interface PaceBarProps {
  /** Spent ÷ limit. Uncapped: the bar reports overspend past its own end. */
  value: number
  /** Days elapsed ÷ days in month — where spending *should* be by now. */
  pace: number
  label: string
  over?: boolean
  aheadOfSchedule?: boolean
  className?: string
}

/**
 * The one chart that matters in a budget: how much is gone against how much of
 * the month is gone. The scheduled tick is what turns "27% spent" into a
 * judgement — 27% on day 3 is fine, on day 26 it is not.
 *
 * Colour carries exactly one meaning here (trouble). Everything else is ink.
 */
export function PaceBar({
  value,
  pace,
  label,
  over,
  aheadOfSchedule,
  className,
}: PaceBarProps) {
  const filled = Math.min(1, Math.max(0, value))
  const percent = Math.round(value * 100)
  const overflow = value > 1 ? Math.min(1, value - 1) : 0

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      // Report the true figure, not the clamped one: an assistive reader must
      // be able to tell 110% from 400%.
      aria-valuenow={percent}
      aria-valuetext={`${percent}% of ${label} spent, ${formatPercent(pace)} of the month elapsed`}
      aria-label={label}
      className={cn('relative h-3 border border-rule bg-sheet-alt', className)}
    >
      <div
        className={cn(
          'absolute inset-y-0 left-0 transition-[width] duration-500 ease-out',
          over ? 'bg-red' : aheadOfSchedule ? 'bg-carbon-2' : 'bg-carbon',
        )}
        style={{ width: `${filled * 100}%` }}
      />

      {/* Overspend hatches back over the bar rather than vanishing at 100%. */}
      {overflow > 0 ? (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0"
          style={{
            width: `${overflow * 100}%`,
            backgroundImage:
              'repeating-linear-gradient(-45deg, var(--sheet) 0 2px, transparent 2px 5px)',
          }}
        />
      ) : null}

      {/* The scheduled tick. */}
      {pace > 0 && pace < 1 ? (
        <div
          aria-hidden="true"
          className="absolute inset-y-[-3px] w-px bg-ink"
          style={{ left: `${pace * 100}%` }}
        />
      ) : null}
    </div>
  )
}
