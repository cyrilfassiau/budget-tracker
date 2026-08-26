import { cn } from '@/lib/cn'

export function Spinner({ className, label = 'Working' }: { className?: string; label?: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block size-3.5 animate-spin rounded-full border border-current border-t-transparent',
        className,
      )}
    />
  )
}
