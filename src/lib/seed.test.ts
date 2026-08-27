import { describe, expect, it } from 'vitest'

import { buildSeedTransactions } from './seed'
import { monthlySeries } from '@/utils/calculations'
import { currentMonthKey } from '@/utils/dates'

describe('seeded demo data', () => {
  const today = new Date('2026-08-27T12:00:00Z')
  const transactions = buildSeedTransactions(today)

  it('spans six months', () => {
    const months = new Set(transactions.map((row) => row.date.slice(0, 7)))
    expect(months.size).toBe(6)
  })

  it('varies spending enough for the trend chart to mean something', () => {
    // The complete months only — the current one is partial by construction.
    const series = monthlySeries(transactions, currentMonthKey(today), 6, today)
      .filter((point) => !point.partial)
      .map((point) => point.expenses)

    const min = Math.min(...series)
    const max = Math.max(...series)
    expect(max / min).toBeGreaterThan(1.25)
  })

  it('keeps rent fixed while discretionary spending moves', () => {
    const rent = transactions.filter((row) => row.categoryId === 'cat-rent')
    expect(new Set(rent.map((row) => row.amount)).size).toBe(1)
  })

  it('records transfers as transfers, not expenses', () => {
    const savings = transactions.filter((row) => row.categoryId === 'cat-savings')
    expect(savings.length).toBeGreaterThan(0)
    expect(savings.every((row) => row.type === 'transfer')).toBe(true)
  })
})
