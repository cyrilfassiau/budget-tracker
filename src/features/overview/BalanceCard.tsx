import { ArrowDownLeft, ArrowLeftRight, Plus } from 'lucide-react'

import { Amount, Card, PaceBar, QuickAction } from '@/components/ui'
import type { StatementData } from '@/hooks/useStatement'
import { useCurrencyFormat } from '@/store/useSettingsStore'
import { useTransactionModal } from '@/store/useTransactionModal'
import { formatMoney, formatPercent } from '@/utils/money'

/**
 * What you have, how the month is going, and the two taps that matter.
 *
 * The pacing line under the balance is the app's one honest guard: it stops a
 * month that is 84% gone from reading like a finished one.
 */
export function BalanceCard({ data }: { data: StatementData }) {
  const { currency, locale } = useCurrencyFormat()
  const openNew = useTransactionModal((state) => state.openNew)
  const { summary, complete, elapsed, totalDays, progress } = data

  return (
    <Card className="flex flex-col gap-5">
      <div>
        <p className="text-[14px] font-semibold text-fg-muted">Balance</p>
        <p className="figure mt-1 text-[40px] font-extrabold leading-none tracking-[-0.035em] text-fg sm:text-[52px]">
          <Amount value={data.carriedForward} plain />
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px]">
          <span className="font-bold text-positive">
            <Amount value={summary.income} plain /> in
          </span>
          <span className="text-fg-faint">·</span>
          <span className="font-bold text-fg">
            <Amount value={summary.expenses} plain /> out
          </span>
          {summary.transfers > 0 ? (
            <>
              <span className="text-fg-faint">·</span>
              <span className="font-semibold text-fg-muted">
                <Amount value={summary.transfers} plain /> moved
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <QuickAction
          label="Add"
          variant="accent"
          icon={<Plus className="size-6" strokeWidth={2.5} />}
          onClick={() => openNew({ type: 'expense' })}
        />
        <QuickAction
          label="Income"
          icon={<ArrowDownLeft className="size-5" strokeWidth={2.5} />}
          onClick={() => openNew({ type: 'income' })}
        />
        <QuickAction
          label="Transfer"
          icon={<ArrowLeftRight className="size-5" strokeWidth={2.5} />}
          onClick={() => openNew({ type: 'transfer' })}
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3 text-[13px]">
          <span className="font-semibold text-fg-muted">
            {complete ? 'Month complete' : `Day ${elapsed} of ${totalDays}`}
          </span>
          <span className="figure font-bold text-fg-muted">
            {formatPercent(progress, locale)} elapsed
          </span>
        </div>
        <PaceBar
          className="mt-2"
          value={progress}
          pace={0}
          label="Month elapsed"
          color="var(--fg-muted)"
        />
        {!complete ? (
          <p className="mt-2 text-[12px] leading-snug text-fg-faint">
            Spending {formatMoney(data.averageDaily, currency, locale, { maximumFractionDigits: 0 })}
            /day so far — about{' '}
            {formatMoney(data.projected, currency, locale, { maximumFractionDigits: 0 })} by month
            end at this rate.
          </p>
        ) : null}
      </div>
    </Card>
  )
}
