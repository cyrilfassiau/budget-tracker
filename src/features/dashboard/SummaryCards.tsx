import { PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react'

import { useCurrencyFormat } from '@/store/useSettingsStore'
import type { DashboardData } from '@/hooks/useDashboard'
import { formatMoney, formatPercent, formatSigned } from '@/utils/money'

import { StatCard } from './StatCard'

/** The four headline numbers for the selected month. */
export function SummaryCards({ data }: { data: DashboardData }) {
  const { currency, locale } = useCurrencyFormat()
  const { summary, incomeChange, expenseChange, averageDaily } = data

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Income"
        value={formatMoney(summary.income, currency, locale)}
        icon={<TrendingUp className="size-4" />}
        tone="income"
        change={incomeChange}
        higherIsBetter
        hint="vs. last month"
      />
      <StatCard
        label="Expenses"
        value={formatMoney(summary.expenses, currency, locale)}
        icon={<TrendingDown className="size-4" />}
        tone="expense"
        change={expenseChange}
        higherIsBetter={false}
        hint={`${formatMoney(averageDaily, currency, locale, { maximumFractionDigits: 0 })}/day`}
      />
      <StatCard
        label="Net balance"
        value={formatSigned(summary.net, currency, locale)}
        icon={<Wallet className="size-4" />}
        tone={summary.net >= 0 ? 'income' : 'expense'}
        hint={`${summary.transactionCount} transaction${summary.transactionCount === 1 ? '' : 's'}`}
      />
      <StatCard
        label="Savings rate"
        value={summary.savingsRate === null ? '—' : formatPercent(summary.savingsRate, locale)}
        icon={<PiggyBank className="size-4" />}
        tone="accent"
        hint={summary.savingsRate === null ? 'No income this month' : 'of income kept'}
      />
    </div>
  )
}
