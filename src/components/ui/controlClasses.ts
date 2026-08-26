import { cn } from '@/lib/cn'

/**
 * Fields are ruled boxes on the sheet, not rounded inputs: square corners, a
 * hairline that darkens on hover, and the carbon ink on focus.
 */
export const controlClasses = cn(
  'w-full border border-rule bg-sheet px-2.5 py-1.5 text-[13px] text-ink',
  'placeholder:text-ink-3 transition-colors duration-100',
  'hover:border-rule-strong focus:border-carbon',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'aria-[invalid=true]:border-red aria-[invalid=true]:bg-red-tint',
)
