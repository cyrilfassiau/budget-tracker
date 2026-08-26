import { describe, expect, it } from 'vitest'

import { makeBudget, makeCategory, makeTransaction } from '@/test/factories'

import {
  averageDailySpend,
  broughtForward,
  budgetProgress,
  budgetStatus,
  comparableSlice,
  entryDelta,
  filterByMonth,
  largestExpense,
  monthlySeries,
  percentChange,
  projectedSpend,
  summarise,
  totalsByCategory,
  withRunningBalance,
} from './calculations'

import { daysElapsed, monthProgress } from './dates'

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

describe('transfers', () => {
  const withTransfer = [
    ...march,
    makeTransaction({ amount: 300, type: 'transfer', categoryId: 'cat-savings', date: '2026-03-20' }),
  ]

  it('leaves transfers out of income and expenses', () => {
    const summary = summarise(withTransfer)
    expect(summary.income).toBe(2000)
    expect(summary.expenses).toBe(800)
    expect(summary.transfers).toBe(300)
  })

  it('does not let a transfer change the net', () => {
    expect(summarise(withTransfer).net).toBe(summarise(march).net)
  })

  it('does not let a transfer lower the savings rate', () => {
    expect(summarise(withTransfer).savingsRate).toBe(summarise(march).savingsRate)
  })

  it('keeps transfers out of the category analysis of spending', () => {
    const totals = totalsByCategory(withTransfer, [...categories, makeCategory({ id: 'cat-savings', kind: 'transfer' })], 'expense')
    expect(totals.map((entry) => entry.categoryId)).not.toContain('cat-savings')
  })

  it('keeps transfers out of the monthly series', () => {
    const [, , latest] = monthlySeries(withTransfer, '2026-03', 3)
    expect(latest).toMatchObject({ income: 2000, expenses: 800 })
  })

  it('moves no money on the balance', () => {
    expect(entryDelta(makeTransaction({ amount: 300, type: 'transfer' }))).toBe(0)
    expect(entryDelta(makeTransaction({ amount: 300, type: 'income' }))).toBe(300)
    expect(entryDelta(makeTransaction({ amount: 300, type: 'expense' }))).toBe(-300)
  })
})

describe('month pacing', () => {
  const midMarch = new Date('2026-03-13T12:00:00Z')

  it('reports a finished month as fully elapsed', () => {
    expect(monthProgress('2026-01', midMarch)).toBe(1)
    expect(daysElapsed('2026-01', midMarch)).toBe(31)
  })

  it('reports a month that has not started as not elapsed', () => {
    expect(monthProgress('2026-06', midMarch)).toBe(0)
  })

  it('reports the current month by days elapsed', () => {
    expect(daysElapsed('2026-03', midMarch)).toBe(13)
    expect(monthProgress('2026-03', midMarch)).toBeCloseTo(13 / 31, 5)
  })

  it('divides the daily rate by days elapsed, not days in the month', () => {
    // 800 spent by the 13th is ~61.54/day, not 800/31 = 25.81.
    expect(averageDailySpend(march, '2026-03', midMarch)).toBeCloseTo(800 / 13, 2)
  })

  it('projects the month at the rate established so far', () => {
    expect(projectedSpend(march, '2026-03', midMarch)).toBeCloseTo((800 / 13) * 31, 0)
  })

  it('marks the current month partial in the series', () => {
    const series = monthlySeries(march, '2026-03', 3, midMarch)
    expect(series.at(-1)?.partial).toBe(true)
    expect(series[0]?.partial).toBe(false)
  })
})

describe('budget pacing', () => {
  const midMarch = new Date('2026-03-13T12:00:00Z')
  const budgets = [makeBudget({ categoryId: 'cat-groceries', month: '2026-03', limit: 400 })]

  it('reports how far through the month the reader is', () => {
    const [row] = budgetProgress(budgets, march, categories, '2026-03', { today: midMarch })
    expect(row?.pace).toBeCloseTo(13 / 31, 5)
  })

  it('flags spending that has outrun the month', () => {
    // 200 of 400 spent, but only 13/31 of the month gone.
    const [row] = budgetProgress(budgets, march, categories, '2026-03', { today: midMarch })
    expect(row?.aheadOfSchedule).toBe(true)
    expect(row?.paceDelta).toBeCloseTo(200 - 400 * (13 / 31), 2)
  })

  it('does not flag spending that is behind schedule', () => {
    const light = [makeTransaction({ amount: 20, categoryId: 'cat-groceries', date: '2026-03-02' })]
    const [row] = budgetProgress(budgets, light, categories, '2026-03', { today: midMarch })
    expect(row?.aheadOfSchedule).toBe(false)
    expect(row?.paceDelta).toBeLessThan(0)
  })

  it('never flags a finished month as ahead of schedule', () => {
    const [row] = budgetProgress(budgets, march, categories, '2026-03', {
      today: new Date('2026-05-01T12:00:00Z'),
    })
    expect(row?.pace).toBe(1)
    expect(row?.aheadOfSchedule).toBe(false)
  })

  it('excludes transfer categories from budgets entirely', () => {
    const savings = makeCategory({ id: 'cat-savings', name: 'Savings', kind: 'transfer' })
    const rows = budgetProgress(
      [makeBudget({ categoryId: 'cat-savings', month: '2026-03', limit: 300 })],
      march,
      [...categories, savings],
      '2026-03',
    )
    expect(rows).toHaveLength(0)
  })
})

describe('comparableSlice', () => {
  it('cuts a month at the given day so comparisons are like-for-like', () => {
    const sliced = comparableSlice(march, '2026-03', 5)
    expect(sliced.map((entry) => entry.date)).toEqual(['2026-03-01', '2026-03-05', '2026-03-02'])
  })

  it('excludes entries after the cutoff', () => {
    expect(comparableSlice(march, '2026-03', 1)).toHaveLength(1)
  })
})

describe('withRunningBalance', () => {
  const entries = [
    makeTransaction({ id: 'a', amount: 1000, type: 'income', date: '2026-03-01' }),
    makeTransaction({ id: 'b', amount: 250, type: 'expense', date: '2026-03-02' }),
    makeTransaction({ id: 'c', amount: 100, type: 'transfer', date: '2026-03-03' }),
    makeTransaction({ id: 'd', amount: 50, type: 'expense', date: '2026-03-04' }),
  ]

  it('carries the balance forward entry by entry', () => {
    const balances = Object.fromEntries(
      withRunningBalance(entries).map((row) => [row.transaction.id, row.balance]),
    )
    expect(balances).toEqual({ a: 1000, b: 750, c: 750, d: 700 })
  })

  it('starts from an opening balance', () => {
    expect(withRunningBalance(entries, 500)[0]?.balance).toBe(1500)
  })

  it('computes chronologically even when the rows are newest-first', () => {
    const reversed = [...entries].reverse()
    const last = withRunningBalance(reversed).find((row) => row.transaction.id === 'd')
    expect(last?.balance).toBe(700)
  })

  it('goes negative when more went out than came in', () => {
    const overdrawn = [makeTransaction({ amount: 40, type: 'expense', date: '2026-03-01' })]
    expect(withRunningBalance(overdrawn)[0]?.balance).toBe(-40)
  })
})

describe('broughtForward', () => {
  it('nets everything before the month', () => {
    const history = [
      makeTransaction({ amount: 500, type: 'income', date: '2026-01-10' }),
      makeTransaction({ amount: 200, type: 'expense', date: '2026-02-10' }),
      makeTransaction({ amount: 999, type: 'expense', date: '2026-03-10' }),
    ]
    expect(broughtForward(history, '2026-03')).toBe(300)
  })

  it('is zero when there is no history', () => {
    expect(broughtForward(march, '2026-01')).toBe(0)
  })
})
