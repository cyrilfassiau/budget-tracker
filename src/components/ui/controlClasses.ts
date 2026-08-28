import { cn } from '@/lib/cn'

export const controlClasses = cn(
  'w-full rounded-[14px] bg-surface-2 px-3.5 py-2.5 text-[15px] font-medium text-fg',
  'placeholder:font-normal placeholder:text-fg-faint',
  'transition-[box-shadow,background-color] duration-150',
  'focus:bg-surface hover:bg-surface-3',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'aria-[invalid=true]:bg-negative-soft',
)
