import { cn } from '@/lib/cn'

/** Shared visual contract for Input, Textarea and Select. */
export const controlClasses = cn(
  'w-full rounded-xl border border-border-base bg-card px-3 py-2 text-sm text-fg',
  'placeholder:text-fg-subtle transition-colors duration-150',
  'hover:border-border-strong focus:border-accent',
  'disabled:cursor-not-allowed disabled:opacity-60',
  'aria-[invalid=true]:border-expense',
)
