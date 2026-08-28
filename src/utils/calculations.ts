import type { Budget, Category, Transaction, TransactionType } from '@/types'

import {
  daysElapsed,
  daysInMonth,
  isCurrentMonth,
  lastNMonths,
  monthProgress,
  toMonthKey,
} from './dates'
import { roundMoney } from './money'

export interface PeriodSummary {
  income: number
  expenses: number

  transfers: number
  net: number

  savingsRate: number | null
  transactionCount: number
}

export interface CategoryTotal {
  categoryId: string
  name: string
  color: string
  icon: string
  total: number

  share: number
  transactionCount: number
}

export interface MonthlyPoint {
  month: string
  income: number
  expenses: number
  net: number

  partial: boolean
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

  ratio: number
  status: BudgetStatus

  pace: number

  paceDelta: number
  aheadOfSchedule: boolean
  budgetId?: string
}

export interface LedgerRow {
  transaction: Transaction
  balance: number
}

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
    transfers: sumBy(transactions, 'transfer'),
    net: roundMoney(income - expenses),
    savingsRate: income > 0 ? roundMoney((income - expenses) / income) : null,
    transactionCount: transactions.length,
  }
}

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

export function monthlySeries(
  transactions: Transaction[],
  month: string,
  count = 6,
  today = new Date(),
): MonthlyPoint[] {
  const months = lastNMonths(count, month)
  const buckets = new Map(
    months.map((key) => [key, { month: key, income: 0, expenses: 0 }]),
  )

  for (const transaction of transactions) {
    const bucket = buckets.get(toMonthKey(transaction.date))
    if (!bucket) continue
    if (transaction.type === 'income') bucket.income += transaction.amount
    else if (transaction.type === 'expense') bucket.expenses += transaction.amount
  }

  return months.map((key) => {
    const bucket = buckets.get(key)!
    return {
      month: key,
      income: roundMoney(bucket.income),
      expenses: roundMoney(bucket.expenses),
      net: roundMoney(bucket.income - bucket.expenses),
      partial: isCurrentMonth(key, today),
    }
  })
}

export function budgetStatus(ratio: number): BudgetStatus {
  if (ratio > 1) return 'over'
  if (ratio >= BUDGET_WARNING_THRESHOLD) return 'warning'
  return 'on-track'
}

export function budgetProgress(
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
  month: string,
  { includeUnbudgeted = false, today = new Date() } = {},
): BudgetProgress[] {
  const monthTransactions = filterByMonth(transactions, month)
  const spentByCategory = new Map<string, number>()
  const pace = monthProgress(month, today)

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
    .filter((category) => category.kind === 'expense' || category.kind === 'both')
    .filter((category) => includeUnbudgeted || monthBudgets.has(category.id))
    .map((category) => {
      const budget = monthBudgets.get(category.id)
      const limit = budget?.limit ?? 0
      const spent = roundMoney(spentByCategory.get(category.id) ?? 0)
      const ratio = limit > 0 ? spent / limit : 0
      const paceDelta = roundMoney(spent - limit * pace)
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
        pace,
        paceDelta,

        aheadOfSchedule: limit > 0 && paceDelta > limit * 0.02,
        budgetId: budget?.id,
      }
    })
    .sort((a, b) => b.ratio - a.ratio || b.spent - a.spent)
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return roundMoney((current - previous) / Math.abs(previous))
}

export function comparableSlice(
  transactions: Transaction[],
  month: string,
  throughDay: number,
): Transaction[] {
  const cutoff = `${month}-${String(throughDay).padStart(2, '0')}`
  return transactions.filter(
    (transaction) => isInMonth(transaction, month) && transaction.date <= cutoff,
  )
}

export function averageDailySpend(
  transactions: Transaction[],
  month: string,
  today = new Date(),
): number {
  const elapsed = daysElapsed(month, today)
  if (elapsed === 0) return 0
  return roundMoney(sumBy(filterByMonth(transactions, month), 'expense') / elapsed)
}

export function projectedSpend(
  transactions: Transaction[],
  month: string,
  today = new Date(),
): number {
  return roundMoney(averageDailySpend(transactions, month, today) * daysInMonth(month))
}

export function largestExpense(transactions: Transaction[]): Transaction | null {
  return transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce<Transaction | null>(
      (largest, transaction) =>
        !largest || transaction.amount > largest.amount ? transaction : largest,
      null,
    )
}

export function entryDelta(transaction: Transaction): number {
  if (transaction.type === 'income') return transaction.amount
  if (transaction.type === 'expense') return -transaction.amount
  return 0
}

export function withRunningBalance(
  rows: Transaction[],
  openingBalance = 0,
): LedgerRow[] {
  const chronological = [...rows].sort((a, b) =>
    a.date === b.date ? a.createdAt.localeCompare(b.createdAt) : a.date.localeCompare(b.date),
  )

  let balance = openingBalance
  const balanceById = new Map<string, number>()
  for (const transaction of chronological) {
    balance = roundMoney(balance + entryDelta(transaction))
    balanceById.set(transaction.id, balance)
  }

  return rows.map((transaction) => ({
    transaction,
    balance: balanceById.get(transaction.id) ?? openingBalance,
  }))
}

export function broughtForward(transactions: Transaction[], month: string): number {
  return roundMoney(
    transactions
      .filter((transaction) => toMonthKey(transaction.date) < month)
      .reduce((total, transaction) => total + entryDelta(transaction), 0),
  )
}
