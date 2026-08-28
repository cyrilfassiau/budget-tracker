import { useMemo } from 'react'

import { useBudgetsStore } from '@/store/useBudgetsStore'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useUIStore } from '@/store/useUIStore'
import type { Transaction } from '@/types'
import {
  averageDailySpend,
  broughtForward,
  budgetProgress,
  comparableSlice,
  filterByMonth,
  monthlySeries,
  percentChange,
  projectedSpend,
  summarise,
  totalsByCategory,
  type BudgetProgress,
  type CategoryTotal,
  type MonthlyPoint,
  type PeriodSummary,
} from '@/utils/calculations'
import {
  daysElapsed,
  daysInMonth,
  isMonthComplete,
  monthProgress,
  shiftMonth,
} from '@/utils/dates'
import { roundMoney } from '@/utils/money'

export interface StatementData {
  month: string
  complete: boolean
  elapsed: number
  totalDays: number
  progress: number

  summary: PeriodSummary

  previousSummary: PeriodSummary
  incomeChange: number | null
  expenseChange: number | null

  broughtForward: number
  carriedForward: number

  spendingByCategory: CategoryTotal[]
  series: MonthlyPoint[]
  budgets: BudgetProgress[]
  overBudgetCount: number
  aheadOfScheduleCount: number

  averageDaily: number
  projected: number
  recent: Transaction[]
  monthTransactions: Transaction[]
}

export function useStatement(today = new Date()): StatementData {
  const transactions = useTransactionsStore((state) => state.items)
  const categories = useCategoriesStore((state) => state.items)
  const budgetRows = useBudgetsStore((state) => state.items)
  const month = useUIStore((state) => state.selectedMonth)

  return useMemo(() => {
    const monthTransactions = filterByMonth(transactions, month)
    const summary = summarise(monthTransactions)

    const elapsed = daysElapsed(month, today)
    const totalDays = daysInMonth(month)
    const complete = isMonthComplete(month, today)

    const previousMonth = shiftMonth(month, -1)
    const throughDay = complete ? daysInMonth(previousMonth) : Math.max(1, elapsed)
    const previousSummary = summarise(comparableSlice(transactions, previousMonth, throughDay))

    const budgets = budgetProgress(budgetRows, transactions, categories, month, { today })
    const opening = broughtForward(transactions, month)

    return {
      month,
      complete,
      elapsed,
      totalDays,
      progress: monthProgress(month, today),

      summary,
      previousSummary,
      incomeChange: percentChange(summary.income, previousSummary.income),
      expenseChange: percentChange(summary.expenses, previousSummary.expenses),

      broughtForward: opening,
      carriedForward: roundMoney(opening + summary.net),

      spendingByCategory: totalsByCategory(monthTransactions, categories, 'expense'),
      series: monthlySeries(transactions, month, 6, today),
      budgets,
      overBudgetCount: budgets.filter((budget) => budget.status === 'over').length,
      aheadOfScheduleCount: budgets.filter(
        (budget) => budget.aheadOfSchedule && budget.status !== 'over',
      ).length,

      averageDaily: averageDailySpend(transactions, month, today),
      projected: projectedSpend(transactions, month, today),
      recent: monthTransactions.slice(0, 6),
      monthTransactions,
    }
  }, [transactions, categories, budgetRows, month, today])
}
