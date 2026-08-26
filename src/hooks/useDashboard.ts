import { useMemo } from 'react'

import { useBudgetsStore } from '@/store/useBudgetsStore'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useUIStore } from '@/store/useUIStore'
import {
  averageDailySpend,
  budgetProgress,
  filterByMonth,
  largestExpense,
  monthlySeries,
  percentChange,
  summarise,
  totalsByCategory,
  type BudgetProgress,
  type CategoryTotal,
  type MonthlyPoint,
  type PeriodSummary,
} from '@/utils/calculations'
import { shiftMonth } from '@/utils/dates'
import type { Transaction } from '@/types'

export interface DashboardData {
  month: string
  summary: PeriodSummary
  previousSummary: PeriodSummary
  incomeChange: number | null
  expenseChange: number | null
  spendingByCategory: CategoryTotal[]
  incomeByCategory: CategoryTotal[]
  series: MonthlyPoint[]
  budgets: BudgetProgress[]
  overBudgetCount: number
  averageDaily: number
  topExpense: Transaction | null
  recent: Transaction[]
  monthTransactions: Transaction[]
}

/**
 * All dashboard numbers in one memoised place. Components below stay
 * presentational, and the maths is unit-tested through `utils/calculations`.
 */
export function useDashboard(): DashboardData {
  const transactions = useTransactionsStore((state) => state.items)
  const categories = useCategoriesStore((state) => state.items)
  const budgetRows = useBudgetsStore((state) => state.items)
  const month = useUIStore((state) => state.selectedMonth)

  return useMemo(() => {
    const monthTransactions = filterByMonth(transactions, month)
    const previousMonth = shiftMonth(month, -1)
    const previousTransactions = filterByMonth(transactions, previousMonth)

    const summary = summarise(monthTransactions)
    const previousSummary = summarise(previousTransactions)
    const budgets = budgetProgress(budgetRows, transactions, categories, month)

    return {
      month,
      summary,
      previousSummary,
      incomeChange: percentChange(summary.income, previousSummary.income),
      expenseChange: percentChange(summary.expenses, previousSummary.expenses),
      spendingByCategory: totalsByCategory(monthTransactions, categories, 'expense'),
      incomeByCategory: totalsByCategory(monthTransactions, categories, 'income'),
      series: monthlySeries(transactions, month, 6),
      budgets,
      overBudgetCount: budgets.filter((budget) => budget.status === 'over').length,
      averageDaily: averageDailySpend(transactions, month),
      topExpense: largestExpense(monthTransactions),
      recent: monthTransactions.slice(0, 5),
      monthTransactions,
    }
  }, [transactions, categories, budgetRows, month])
}
