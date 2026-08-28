import { cn } from '@/lib/cn'
import { useCurrencyFormat } from '@/store/useSettingsStore'
import { formatMoney } from '@/utils/money'

interface AmountProps {
  value: number

  plain?: boolean
  blankZero?: boolean
  whole?: boolean

  signed?: boolean
  className?: string
}

export function Amount({ value, plain, blankZero, whole, signed, className }: AmountProps) {
  const { currency, locale } = useCurrencyFormat()

  if (blankZero && value === 0) {
    return <span className={cn('figure text-fg-faint', className)}>—</span>
  }

  const formatted = formatMoney(
    Math.abs(value),
    currency,
    locale,
    whole ? { maximumFractionDigits: 0 } : {},
  )

  if (plain) {
    return <span className={cn('figure whitespace-nowrap', className)}>{formatted}</span>
  }

  const positive = value > 0

  return (
    <span
      className={cn(
        'figure whitespace-nowrap',
        signed && positive && 'text-positive',
        !signed && value < 0 && 'text-negative',
        className,
      )}
    >
      {signed && positive ? '+' : value < 0 ? '−' : ''}
      {formatted}
    </span>
  )
}
