import { Link } from 'react-router-dom'

import { TrendChart, TrendKey } from '@/components/charts/TrendChart'
import { AppLayout } from '@/components/layout/AppLayout'
import { PeriodPicker } from '@/components/layout/PeriodPicker'
import { Button, EmptyState, Sheet, SheetHead } from '@/components/ui'
import { BudgetRow } from '@/features/budgets/BudgetRow'
import { AnalysisTable } from '@/features/statement/AnalysisTable'
import { StatementSkeleton } from '@/features/statement/StatementSkeleton'
import { SummaryBlock } from '@/features/statement/SummaryBlock'
import { RegisterEntry, RegisterHead } from '@/features/transactions/RegisterEntry'
import { useCategoryMap, useIsLoading, useNearestMonthWithEntries } from '@/hooks/useAppData'
import { useStatement } from '@/hooks/useStatement'
import { useTransactionModal } from '@/store/useTransactionModal'
import { useUIStore } from '@/store/useUIStore'
import { formatMonthLabel } from '@/utils/dates'

export function StatementPage() {
  const data = useStatement()
  const loading = useIsLoading()
  const categories = useCategoryMap()
  const openNew = useTransactionModal((state) => state.openNew)
  const openEdit = useTransactionModal((state) => state.openEdit)
  const setMonth = useUIStore((state) => state.setMonth)
  const nearest = useNearestMonthWithEntries(data.month)

  const hasEntries = data.summary.transactionCount > 0

  return (
    <AppLayout title="Statement" actions={<PeriodPicker />}>
      {loading ? (
        <StatementSkeleton />
      ) : !hasEntries ? (
        <Sheet className="animate-in">
          <SheetHead title={formatMonthLabel(data.month)} meta="No entries" />
          <EmptyState
            title="This period is empty"
            description={
              // The CTA below books into the period on screen, not into today.
              'Record an entry here, or turn to a period that already has some.'
            }
            action={
              <>
                <Button variant="primary" onClick={() => openNew()}>
                  Record an entry
                </Button>
                {nearest && nearest !== data.month ? (
                  <Button variant="secondary" onClick={() => setMonth(nearest)}>
                    Turn to {formatMonthLabel(nearest, 'MMM yyyy')}
                  </Button>
                ) : null}
              </>
            }
          />
        </Sheet>
      ) : (
        <div className="flex animate-in flex-col gap-4">
          <Sheet>
            <SheetHead
              title={formatMonthLabel(data.month)}
              meta={data.complete ? 'Closed' : `Open · day ${data.elapsed} of ${data.totalDays}`}
            />
            <SummaryBlock data={data} />
          </Sheet>

          <div className="grid gap-4 lg:grid-cols-2">
            <Sheet>
              <SheetHead title="Six periods" action={<TrendKey />} />
              <div className="px-3 py-3 sm:px-4">
                <TrendChart data={data.series} activeMonth={data.month} />
              </div>
            </Sheet>

            <Sheet>
              <SheetHead title="Analysis of payments" />
              <AnalysisTable rows={data.spendingByCategory} total={data.summary.expenses} />
            </Sheet>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Sheet>
              <SheetHead
                title="Budgets"
                meta={
                  data.overBudgetCount > 0
                    ? `${data.overBudgetCount} over`
                    : data.aheadOfScheduleCount > 0
                      ? `${data.aheadOfScheduleCount} ahead of pace`
                      : undefined
                }
                action={
                  <Link
                    to="/budgets"
                    className="font-narrow text-[12px] font-semibold uppercase tracking-[0.07em] text-carbon underline underline-offset-4 hover:text-ink"
                  >
                    All budgets
                  </Link>
                }
              />

              {data.budgets.length === 0 ? (
                <EmptyState
                  size="sm"
                  title="No limits set"
                  description="A limit turns spending into something you can be ahead of, or behind."
                  action={
                    <Link
                      to="/budgets"
                      className="inline-flex h-7 items-center border border-rule-strong bg-sheet px-2.5 font-narrow text-[12px] font-semibold uppercase tracking-[0.07em] text-ink hover:bg-sheet-alt"
                    >
                      Set a limit
                    </Link>
                  }
                />
              ) : (
                <ul>
                  {data.budgets.slice(0, 5).map((budget) => (
                    <BudgetRow key={budget.categoryId} budget={budget} compact />
                  ))}
                  {data.budgets.length > 5 ? (
                    <li className="border-t border-rule px-4 py-2 sm:px-5">
                      <Link
                        to="/budgets"
                        className="stamp text-ink-3 underline underline-offset-4 hover:text-ink"
                      >
                        {data.budgets.length - 5} more
                      </Link>
                    </li>
                  ) : null}
                </ul>
              )}
            </Sheet>

            <Sheet className="overflow-hidden">
              <SheetHead
                title="Latest entries"
                action={
                  <Link
                    to="/transactions"
                    className="font-narrow text-[12px] font-semibold uppercase tracking-[0.07em] text-carbon underline underline-offset-4 hover:text-ink"
                  >
                    Full register
                  </Link>
                }
              />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <caption className="sr-only">Latest entries this period</caption>
                  <RegisterHead />
                  <tbody>
                    {data.recent.map((transaction, index) => (
                      <RegisterEntry
                        key={transaction.id}
                        transaction={transaction}
                        category={categories.get(transaction.categoryId)}
                        startsDay={
                          index === 0 || data.recent[index - 1]!.date !== transaction.date
                        }
                        onEdit={openEdit}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </Sheet>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
