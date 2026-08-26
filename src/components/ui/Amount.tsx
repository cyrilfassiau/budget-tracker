import { cn } from '@/lib/cn'
import { useCurrencyFormat } from '@/store/useSettingsStore'
import { formatMoney } from '@/utils/money'

interface AmountProps {
  value: number
  /**
   * Ledger convention: a negative figure prints in red. Set `plain` for
   * figures where sign carries no judgement (a column total that is expected
   * to be an outgoing).
   */
  plain?: boolean
  /** Renders a dash instead of 0.00, the way a ruled column leaves a cell empty. */
  blankZero?: boolean
  whole?: boolean
  className?: string
}

/**
 * Every figure in the app goes through here, so alignment, tabular numerals
 * and the red-for-negative rule are decided in exactly one place.
 */
export function Amount({ value, plain, blankZero, whole, className }: AmountProps) {
  const { currency, locale } = useCurrencyFormat()

  if (blankZero && value === 0) {
    return (
      <span aria-hidden="true" className={cn('figure text-ink-3', className)}>
        —
      </span>
    )
  }

  return (
    <span
      className={cn('figure whitespace-nowrap', !plain && value < 0 && 'dr', className)}
    >
      {formatMoney(Math.abs(value), currency, locale, whole ? { maximumFractionDigits: 0 } : {})}
      {!plain && value < 0 ? <span className="ml-0.5 text-[0.85em]">DR</span> : null}
    </span>
  )
}
