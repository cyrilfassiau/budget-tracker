import { cn } from '@/lib/cn'

interface ProgressBarProps {
  /** 0–1; values above 1 are rendered as a full bar with an overflow tint. */
  value: number
  label: string
  color?: string
  tone?: 'default' | 'warning' | 'over'
  size?: 'sm' | 'md'
  className?: string
}

export function ProgressBar({
  value,
  label,
  color,
  tone = 'default',
  size = 'md',
  className,
}: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, value))
  const percent = Math.round(value * 100)

  const barColor =
    tone === 'over'
      ? 'var(--expense)'
      : tone === 'warning'
        ? 'var(--warning)'
        : (color ?? 'var(--accent)')

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(100, percent)}
      aria-valuetext={`${percent}% of ${label}`}
      aria-label={label}
      className={cn(
        'w-full overflow-hidden rounded-full bg-bg-subtle',
        size === 'md' ? 'h-2' : 'h-1.5',
        className,
      )}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${clamped * 100}%`, backgroundColor: barColor }}
      />
    </div>
  )
}
