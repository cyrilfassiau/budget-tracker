import { cn } from '@/lib/cn'
import { formatPercent } from '@/utils/money'

interface PaceBarProps {
  /** Spent ÷ limit, uncapped. */
  value: number
  /** Days elapsed ÷ days in month — where spending should be by now. */
  pace: number
  label: string
  /** The category's own colour; status overrides it. */
  color?: string
  over?: boolean
  aheadOfSchedule?: boolean
  className?: string
}

/**
 * Spend against limit, with a tick marking how much of the month has gone.
 * Without that tick "27% spent" is a number with no verdict attached.
 */
export function PaceBar({
  value,
  pace,
  label,
  color,
  over,
  aheadOfSchedule,
  className,
}: PaceBarProps) {
  const filled = Math.min(1, Math.max(0, value))
  const percent = Math.round(value * 100)

  const fill = over
    ? 'var(--negative)'
    : aheadOfSchedule
      ? 'var(--caution)'
      : (color ?? 'var(--accent)')

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      // The true figure, not the clamped one: 110% must be tellable from 400%.
      aria-valuenow={percent}
      aria-valuetext={`${percent}% of ${label} spent, ${formatPercent(pace)} of the month elapsed`}
      aria-label={label}
      className={cn('relative h-2 overflow-hidden rounded-full bg-surface-3', className)}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${filled * 100}%`, backgroundColor: fill }}
      />

      {pace > 0 && pace < 1 ? (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 w-0.5 rounded-full bg-fg/70"
          style={{ left: `${pace * 100}%` }}
        />
      ) : null}
    </div>
  )
}
