import { describe, expect, it } from 'vitest'

import { makeBudget, makeCategory, makeTransaction } from '@/test/factories'

import {
  averageDailySpend,
  budgetProgress,
  budgetStatus,
  filterByMonth,
  largestExpense,
  monthlySeries,
  percentChange,
  summarise,
  totalsByCategory,
} from './calculations'

const groceries = makeCategory({ id: 'cat-groceries', name: 'Groceries', color: '#f97316' })
const rent = makeCategory({ id: 'cat-rent', name: 'Rent', color: '#6366f1' })
const salary = makeCategory({ id: 'cat-salary', name: 'Salary', kind: 'income' })
const categories = [groceries, rent, salary]

const march = [
  makeTransaction({ amount: 2000, type: 'income', categoryId: 'cat-salary', date: '2026-03-01' }),
  makeTransaction({ amount: 120, categoryId: 'cat-groceries', date: '2026-03-05' }),
  makeTransaction({ amount: 80, categoryId: 'cat-groceries', date: '2026-03-12' }),
  makeTransaction({ amount: 600, categoryId: 'cat-rent', date: '2026-03-02' }),
]

describe('filterByMonth', () => {
  it('keeps only transactions in the given month', () => {
    const transactions = [...march, makeTransaction({ date: '2026-02-27' })]
    expect(filterByMonth(transactions, '2026-03')).toHaveLength(4)
  })

  it('returns an empty array for a month with no activity', () => {
    expect(filterByMonth(march, '2025-12')).toEqual([])
  })
})

describe('summarise', () => {
  it('totals income, expenses and net', () => {
    const summary = summarise(march)
    expect(summary.income).toBe(2000)
    expect(summary.expenses).toBe(800)
    expect(summary.net).toBe(1200)
    expect(summary.transactionCount).toBe(4)
  })

  it('computes savings rate as the share of income kept', () => {
    expect(summarise(march).savingsRate).toBe(0.6)
  })

  it('returns a null savings rate when there was no income', () => {
    expect(summarise([makeTransaction({ amount: 50 })]).savingsRate).toBeNull()
  })

  it('handles an empty period', () => {
    expect(summarise([])).toMatchObject({ income: 0, expenses: 0, net: 0, savingsRate: null })
  })
})

describe('totalsByCategory', () => {
  it('groups expenses by category, largest first', () => {
    const totals = totalsByCategory(march, categories, 'expense')
    expect(totals.map((entry) => entry.name)).toEqual(['Rent', 'Groceries'])
    expect(totals[0]?.total).toBe(600)
    expect(totals[1]?.total).toBe(200)
  })

  it('computes each category share of the period', () => {
    const totals = totalsByCategory(march, categories, 'expense')
    expect(totals[0]?.share).toBeCloseTo(0.75)
    expect(totals[1]?.share).toBeCloseTo(0.25)
  })

  it('omits categories with no activity', () => {
    expect(totalsByCategory(march, categories, 'expense')).toHaveLength(2)
  })

  it('falls back to Uncategorized for unknown category ids', () => {
    const orphan = [makeTransaction({ categoryId: 'gone', amount: 5 })]
    expect(totalsByCategory(orphan, categories, 'expense')[0]?.name).toBe('Uncategorized')
  })
})

describe('monthlySeries', () => {
  it('returns one point per month, oldest first', () => {
    const series = monthlySeries(march, '2026-03', 3)
    expect(series.map((point) => point.month)).toEqual(['2026-01', '2026-02', '2026-03'])
  })

  it('fills months with no transactions with zeroes', () => {
    const series = monthlySeries(march, '2026-03', 3)
    expect(series[0]).toMatchObject({ income: 0, expenses: 0, net: 0 })
  })

  it('splits income and expenses per month', () => {
    const [, , latest] = monthlySeries(march, '2026-03', 3)
    expect(latest).toMatchObject({ income: 2000, expenses: 800, net: 1200 })
  })
})

describe('budgetStatus', () => {
  it('flags over-budget above the limit', () => {
    expect(budgetStatus(1.01)).toBe('over')
  })

  it('warns from 80% of the limit', () => {
    expect(budgetStatus(0.8)).toBe('warning')
    expect(budgetStatus(0.99)).toBe('warning')
  })

  it('is on track below the warning threshold', () => {
    expect(budgetStatus(0.79)).toBe('on-track')
  })

  it('treats exactly the limit as not yet over', () => {
    expect(budgetStatus(1)).toBe('warning')
  })
})

describe('budgetProgress', () => {
  const budgets = [
    makeBudget({ categoryId: 'cat-groceries', month: '2026-03', limit: 250 }),
    makeBudget({ categoryId: 'cat-rent', month: '2026-03', limit: 500 }),
  ]

  it('joins limits with what was spent in the month', () => {
    const rows = budgetProgress(budgets, march, categories, '2026-03')
    const grocery = rows.find((row) => row.categoryId === 'cat-groceries')
    expect(grocery).toMatchObject({ spent: 200, limit: 250, remaining: 50, status: 'warning' })
  })

  it('marks a category over budget and reports the overspend', () => {
    const rows = budgetProgress(budgets, march, categories, '2026-03')
    const rentRow = rows.find((row) => row.categoryId === 'cat-rent')
    expect(rentRow?.status).toBe('over')
    expect(rentRow?.remaining).toBe(-100)
  })

  it('ignores income when measuring spend', () => {
    const rows = budgetProgress(
      [makeBudget({ categoryId: 'cat-salary', month: '2026-03', limit: 100 })],
      march,
      categories,
      '2026-03',
    )
    expect(rows).toHaveLength(0)
  })

  it('excludes categories without a limit unless asked for them', () => {
    const onlyRent = [makeBudget({ categoryId: 'cat-rent', month: '2026-03', limit: 500 })]
    expect(budgetProgress(onlyRent, march, categories, '2026-03')).toHaveLength(1)
    expect(
      budgetProgress(onlyRent, march, categories, '2026-03', { includeUnbudgeted: true }),
    ).toHaveLength(2)
  })

  it('ignores limits set for another month', () => {
    const aprilBudget = [makeBudget({ categoryId: 'cat-groceries', month: '2026-04', limit: 250 })]
    expect(budgetProgress(aprilBudget, march, categories, '2026-03')).toHaveLength(0)
  })
})

describe('percentChange', () => {
  it('reports growth and decline', () => {
    expect(percentChange(150, 100)).toBe(0.5)
    expect(percentChange(50, 100)).toBe(-0.5)
  })

  it('returns null when there is no baseline to compare against', () => {
    expect(percentChange(100, 0)).toBeNull()
  })
})

describe('averageDailySpend', () => {
  it('divides the month expenses by the days in that month', () => {
    expect(averageDailySpend(march, '2026-03')).toBeCloseTo(800 / 31, 2)
  })

  it('accounts for February being short', () => {
    const february = [makeTransaction({ amount: 280, date: '2026-02-10' })]
    expect(averageDailySpend(february, '2026-02')).toBeCloseTo(10, 2)
  })
})

describe('largestExpense', () => {
  it('finds the biggest single expense', () => {
    expect(largestExpense(march)?.amount).toBe(600)
  })

  it('returns null when there are no expenses', () => {
    expect(largestExpense([march[0]!])).toBeNull()
  })
})
