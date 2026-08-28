export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function formatMoney(
  value: number,
  currency = 'EUR',
  locale = 'en-GB',
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    ...options,
  }).format(roundMoney(value))
}

export function formatMoneyCompact(value: number, currency = 'EUR', locale = 'en-GB'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatSigned(
  value: number,
  currency = 'EUR',
  locale = 'en-GB',
): string {
  const formatted = formatMoney(Math.abs(value), currency, locale)
  if (value === 0) return formatted
  return `${value > 0 ? '+' : '−'}${formatted}`
}

export function formatPercent(value: number, locale = 'en-GB'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value)
}

export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[^\d.,-]/g, '').trim()
  if (!cleaned) return null

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')
  let normalised = cleaned

  if (lastComma > -1 && lastDot > -1) {
    normalised =
      lastComma > lastDot
        ? cleaned.replace(/\./g, '').replace(',', '.')
        : cleaned.replace(/,/g, '')
  } else if (lastComma > -1) {
    const decimals = cleaned.length - lastComma - 1
    normalised = decimals === 3 ? cleaned.replace(/,/g, '') : cleaned.replace(',', '.')
  }

  const value = Number.parseFloat(normalised)
  return Number.isFinite(value) ? roundMoney(value) : null
}
