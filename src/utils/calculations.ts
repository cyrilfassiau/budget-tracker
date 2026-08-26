import type { Budget, Category, Transaction, TransactionType } from '@/types'

import { lastNMonths, monthBounds, toMonthKey } from './dates'
import { roundMoney } from './money'

export interface PeriodSummary {
  income: number
  expenses: number
  net: number
  /** Share of income that was not spent; `null` when there was no income. */
  savingsRate: number | null
  transactionCount: number
}

export interface CategoryTotal {
  categoryId: string
  name: string
  color: string
  icon: string
  total: number
  /** Share of the period's total for this transaction type, 0–1. */
  share: number
  transactionCount: number
}

export interface MonthlyPoint {
  month: string
  income: number
  expenses: number
  net: number
}

export type BudgetStatus = 'on-track' | 'warning' | 'over'

export interface BudgetProgress {
  categoryId: string
  name: string
  color: string
  icon: string
  limit: number
  spent: number
  remaining: number
  /** Spent ÷ limit, uncapped, so "142%" can be displayed. */
  ratio: number
  status: BudgetStatus
  budgetId?: string
}

/** Spending is considered "at risk" from this share of the limit onwards. */
export const BUDGET_WARNING_THRESHOLD = 0.8

export function isInMonth(transaction: Transaction, month: string): boolean {
  return transaction.date.startsWith(month)
}

export function filterByMonth(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter((transaction) => isInMonth(transaction, month))
}

export function filterByDateRange(
  transactions: Transaction[],
  from: string,
  to: string,
): Transaction[] {
  return transactions.filter(
    (transaction) => transaction.date >= from && transaction.date <= to,
  )
}

export function sumBy(transactions: Transaction[], type: TransactionType): number {
  return roundMoney(
    transactions.reduce(
      (total, transaction) => (transaction.type === type ? total + transaction.amount : total),
      0,
    ),
  )
}

export function summarise(transactions: Transaction[]): PeriodSummary {
  const income = sumBy(transactions, 'income')
  const expenses = sumBy(transactions, 'expense')
  return {
    income,
    expenses,
    net: roundMoney(income - expenses),
    savingsRate: income > 0 ? roundMoney((income - expenses) / income) : null,
    transactionCount: transactions.length,
  }
}

/**
 * Totals per category for one transaction type, largest first. Categories with
 * no activity are omitted — an empty slice is noise in a donut chart.
 */
export function totalsByCategory(
  transactions: Transaction[],
  categories: Category[],
  type: TransactionType,
): CategoryTotal[] {
  const byId = new Map(categories.map((category) => [category.id, category]))
  const totals = new Map<string, { total: number; count: number }>()

  for (const transaction of transactions) {
    if (transaction.type !== type) continue
    const current = totals.get(transaction.categoryId) ?? { total: 0, count: 0 }
    current.total += transaction.amount
    current.count += 1
    totals.set(transaction.categoryId, current)
  }

  const grandTotal = [...totals.values()].reduce((sum, entry) => sum + entry.total, 0)

  return [...totals.entries()]
    .map(([categoryId, entry]) => {
      const category = byId.get(categoryId)
      return {
        categoryId,
        name: category?.name ?? 'Uncategorized',
        color: category?.color ?? '#64748b',
        icon: category?.icon ?? 'circle',
        total: roundMoney(entry.total),
        share: grandTotal > 0 ? entry.total / grandTotal : 0,
        transactionCount: entry.count,
      }
    })
    .sort((a, b) => b.total - a.total)
}

/** Income/expense/net for each of the last `count` months ending at `month`. */
export function monthlySeries(
  transactions: Transaction[],
  month: string,
  count = 6,
): MonthlyPoint[] {
  const months = lastNMonths(count, month)
  const buckets = new Map(
    months.map((key) => [key, { month: key, income: 0, expenses: 0, net: 0 }]),
  )

  for (const transaction of transactions) {
    const bucket = buckets.get(toMonthKey(transaction.date))
    if (!bucket) continue
    if (transaction.type === 'income') bucket.income += transaction.amount
    else bucket.expenses += transaction.amount
  }

  return months.map((key) => {
    const bucket = buckets.get(key)!
    return {
      month: key,
      income: roundMoney(bucket.income),
      expenses: roundMoney(bucket.expenses),
      net: roundMoney(bucket.income - bucket.expenses),
    }
  })
}

export function budgetStatus(ratio: number): BudgetStatus {
  if (ratio > 1) return 'over'
  if (ratio >= BUDGET_WARNING_THRESHOLD) return 'warning'
  return 'on-track'
}

/**
 * Joins budgets, categories and the month's transactions into the rows the
 * budget UI renders. Expense categories without a limit are included with
 * `limit: 0` so the UI can offer to set one.
 */
export function budgetProgress(
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
  month: string,
  { includeUnbudgeted = false } = {},
): BudgetProgress[] {
  const monthTransactions = filterByMonth(transactions, month)
  const spentByCategory = new Map<string, number>()

  for (const transaction of monthTransactions) {
    if (transaction.type !== 'expense') continue
    spentByCategory.set(
      transaction.categoryId,
      (spentByCategory.get(transaction.categoryId) ?? 0) + transaction.amount,
    )
  }

  const monthBudgets = new Map(
    budgets.filter((budget) => budget.month === month).map((budget) => [budget.categoryId, budget]),
  )

  return categories
    .filter((category) => category.kind !== 'income')
    .filter((category) => includeUnbudgeted || monthBudgets.has(category.id))
    .map((category) => {
      const budget = monthBudgets.get(category.id)
      const limit = budget?.limit ?? 0
      const spent = roundMoney(spentByCategory.get(category.id) ?? 0)
      const ratio = limit > 0 ? spent / limit : 0
      return {
        categoryId: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        limit,
        spent,
        remaining: roundMoney(limit - spent),
        ratio,
        status: limit > 0 ? budgetStatus(ratio) : 'on-track',
        budgetId: budget?.id,
      }
    })
    .sort((a, b) => b.ratio - a.ratio || b.spent - a.spent)
}

/** Percentage change against a previous value, `null` when there is no base. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return roundMoney((current - previous) / Math.abs(previous))
}

/** Average daily spend for the month, useful as a dashboard sub-stat. */
export function averageDailySpend(transactions: Transaction[], month: string): number {
  const { to } = monthBounds(month)
  const daysInMonth = Number(to.slice(-2))
  const expenses = sumBy(filterByMonth(transactions, month), 'expense')
  return roundMoney(expenses / daysInMonth)
}

/** Largest single expense in the period — surfaced on the dashboard. */
export function largestExpense(transactions: Transaction[]): Transaction | null {
  return transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce<Transaction | null>(
      (largest, transaction) =>
        !largest || transaction.amount > largest.amount ? transaction : largest,
      null,
    )
}
