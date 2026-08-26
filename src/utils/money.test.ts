import { describe, expect, it } from 'vitest'

import { formatMoney, formatSigned, parseAmount, roundMoney } from './money'

describe('roundMoney', () => {
  it('rounds to two decimals', () => {
    expect(roundMoney(10.005)).toBe(10.01)
    expect(roundMoney(1.115)).toBe(1.12)
  })

  it('keeps repeated additions from drifting', () => {
    const total = [0.1, 0.2, 0.3].reduce((sum, value) => sum + value, 0)
    expect(roundMoney(total)).toBe(0.6)
  })
})

describe('parseAmount', () => {
  it('reads plain numbers', () => {
    expect(parseAmount('12.50')).toBe(12.5)
    expect(parseAmount('7')).toBe(7)
  })

  it('reads comma decimal separators', () => {
    expect(parseAmount('12,50')).toBe(12.5)
  })

  it('reads thousands separators in both conventions', () => {
    expect(parseAmount('1,234.56')).toBe(1234.56)
    expect(parseAmount('1.234,56')).toBe(1234.56)
    expect(parseAmount('1,234')).toBe(1234)
  })

  it('ignores currency symbols and spaces', () => {
    expect(parseAmount('€ 89.90')).toBe(89.9)
  })

  it('returns null when there is no number', () => {
    expect(parseAmount('')).toBeNull()
    expect(parseAmount('abc')).toBeNull()
  })

  it('keeps a negative sign so validation can reject it', () => {
    expect(parseAmount('-5')).toBe(-5)
  })
})

describe('formatMoney', () => {
  it('formats with the requested currency and locale', () => {
    expect(formatMoney(1234.5, 'EUR', 'en-GB')).toBe('€1,234.50')
  })

  it('marks direction with a sign', () => {
    expect(formatSigned(10, 'EUR', 'en-GB')).toBe('+€10.00')
    expect(formatSigned(-10, 'EUR', 'en-GB')).toBe('−€10.00')
    expect(formatSigned(0, 'EUR', 'en-GB')).toBe('€0.00')
  })
})
