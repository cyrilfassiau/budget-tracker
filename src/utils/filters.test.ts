import { describe, expect, it } from 'vitest'

import { makeTransaction } from '@/test/factories'

import {
  EMPTY_FILTERS,
  applyFilters,
  countActiveFilters,
  pageCount,
  paginate,
  sortTransactions,
} from './filters'

const transactions = [
  makeTransaction({ id: 'a', note: 'Weekly shop', amount: 45, date: '2026-03-02', categoryId: 'cat-groceries' }),
  makeTransaction({ id: 'b', note: 'Monthly salary', amount: 3000, type: 'income', date: '2026-03-01', categoryId: 'cat-salary' }),
  makeTransaction({ id: 'c', note: 'Train ticket', amount: 12, date: '2026-02-20', categoryId: 'cat-transport' }),
]

describe('applyFilters', () => {
  it('returns everything when no filter is set', () => {
    expect(applyFilters(transactions, EMPTY_FILTERS)).toHaveLength(3)
  })

  it('filters by type', () => {
    const result = applyFilters(transactions, { ...EMPTY_FILTERS, type: 'income' })
    expect(result.map((entry) => entry.id)).toEqual(['b'])
  })

  it('filters by category', () => {
    const result = applyFilters(transactions, {
      ...EMPTY_FILTERS,
      categoryIds: ['cat-transport'],
    })
    expect(result.map((entry) => entry.id)).toEqual(['c'])
  })

  it('searches notes case-insensitively', () => {
    const result = applyFilters(transactions, { ...EMPTY_FILTERS, search: 'SALARY' })
    expect(result.map((entry) => entry.id)).toEqual(['b'])
  })

  it('applies an inclusive date range', () => {
    const result = applyFilters(transactions, {
      ...EMPTY_FILTERS,
      from: '2026-03-01',
      to: '2026-03-02',
    })
    expect(result.map((entry) => entry.id).sort()).toEqual(['a', 'b'])
  })

  it('combines filters as AND', () => {
    const result = applyFilters(transactions, {
      ...EMPTY_FILTERS,
      type: 'expense',
      from: '2026-03-01',
    })
    expect(result.map((entry) => entry.id)).toEqual(['a'])
  })
})

describe('sortTransactions', () => {
  it('sorts by date descending by default', () => {
    const sorted = sortTransactions(transactions, { field: 'date', direction: 'desc' })
    expect(sorted.map((entry) => entry.id)).toEqual(['a', 'b', 'c'])
  })

  it('sorts by date ascending', () => {
    const sorted = sortTransactions(transactions, { field: 'date', direction: 'asc' })
    expect(sorted.map((entry) => entry.id)).toEqual(['c', 'b', 'a'])
  })

  it('sorts by amount', () => {
    const sorted = sortTransactions(transactions, { field: 'amount', direction: 'desc' })
    expect(sorted.map((entry) => entry.amount)).toEqual([3000, 45, 12])
  })

  it('does not mutate the input array', () => {
    const input = [...transactions]
    sortTransactions(input, { field: 'amount', direction: 'asc' })
    expect(input.map((entry) => entry.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('pagination', () => {
  const rows = Array.from({ length: 25 }, (_, index) => index + 1)

  it('slices the requested page', () => {
    expect(paginate(rows, 2, 10)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
  })

  it('returns a short final page', () => {
    expect(paginate(rows, 3, 10)).toHaveLength(5)
  })

  it('counts pages, with a minimum of one', () => {
    expect(pageCount(25, 10)).toBe(3)
    expect(pageCount(0, 10)).toBe(1)
  })
})

describe('countActiveFilters', () => {
  it('counts a date range as a single filter', () => {
    expect(
      countActiveFilters({ ...EMPTY_FILTERS, from: '2026-01-01', to: '2026-01-31' }),
    ).toBe(1)
  })

  it('ignores whitespace-only searches', () => {
    expect(countActiveFilters({ ...EMPTY_FILTERS, search: '   ' })).toBe(0)
  })
})
