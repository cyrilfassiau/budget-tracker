import { Amount } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { StatementData } from '@/hooks/useStatement'
import { useCurrencyFormat } from '@/store/useSettingsStore'
import { formatMoney, formatPercent } from '@/utils/money'

interface LineProps {
  label: string
  value: number
  note?: string
  emphasis?: boolean
  plain?: boolean
}

function Line({ label, value, note, emphasis, plain }: LineProps) {
  return (
    <tr className={cn('border-t border-rule', emphasis && 'border-t-2 border-ink')}>
      <th
        scope="row"
        className={cn(
          'py-2 pl-4 pr-2 text-left font-normal sm:pl-5',
          emphasis ? 'col-head text-ink' : 'text-[13px] text-ink-2',
        )}
      >
        {label}
      </th>
      <td className="hidden py-2 pr-2 text-[11px] text-ink-3 sm:table-cell">{note}</td>
      <td
        className={cn(
          'whitespace-nowrap py-2 pl-2 pr-4 text-right sm:pr-5',
          emphasis ? 'text-[15px] font-semibold' : 'text-[13px]',
        )}
      >
        <Amount value={value} plain={plain} />
      </td>
    </tr>
  )
}

/**
 * The passbook's account summary: brought forward, what moved, carried
 * forward. It replaces the row of stat cards because those four boxes were
 * four unrelated facts pretending to be a structure — this is one arithmetic
 * the reader can follow down the column and check.
 */
export function SummaryBlock({ data }: { data: StatementData }) {
  const { currency, locale } = useCurrencyFormat()
  const { summary, previousSummary, expenseChange, complete, elapsed } = data

  const comparison = complete
    ? 'against the previous period'
    : `against the same ${elapsed} ${elapsed === 1 ? 'day' : 'days'} last period`

  return (
    <div>
      <table className="w-full">
        <caption className="sr-only">Account summary for the period</caption>
        <tbody>
          <Line
            label="Brought forward"
            value={data.broughtForward}
            note="Balance at the start of the period"
          />
          <Line
            label="Paid in"
            value={summary.income}
            plain
            note={
              previousSummary.income > 0
                ? `${formatMoney(previousSummary.income, currency, locale)} ${comparison}`
                : undefined
            }
          />
          <Line
            label="Paid out"
            value={summary.expenses}
            plain
            note={
              previousSummary.expenses > 0
                ? `${formatMoney(previousSummary.expenses, currency, locale)} ${comparison}`
                : undefined
            }
          />
          {summary.transfers > 0 ? (
            <Line
              label="Transferred"
              value={summary.transfers}
              plain
              note="Moved between your own accounts — not counted above"
            />
          ) : null}
          <Line label="Carried forward" value={data.carriedForward} emphasis />
        </tbody>
      </table>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-rule px-4 py-3 sm:grid-cols-4 sm:px-5">
        <div>
          <dt className="col-head text-ink-3">Net this period</dt>
          <dd className="mt-0.5 text-[14px] font-semibold">
            <Amount value={summary.net} />
          </dd>
        </div>
        <div>
          <dt className="col-head text-ink-3">Kept of income</dt>
          <dd className="figure mt-0.5 text-[14px] font-semibold text-ink">
            {summary.savingsRate === null ? '—' : formatPercent(summary.savingsRate, locale)}
          </dd>
        </div>
        <div>
          <dt className="col-head text-ink-3">Per day so far</dt>
          <dd className="mt-0.5 text-[14px] font-semibold text-ink">
            <Amount value={data.averageDaily} plain whole />
          </dd>
        </div>
        <div>
          <dt className="col-head text-ink-3">
            {complete ? 'Entries' : 'At this rate'}
          </dt>
          <dd className="mt-0.5 text-[14px] font-semibold text-ink">
            {complete ? (
              <span className="figure">{summary.transactionCount}</span>
            ) : (
              <Amount value={data.projected} plain whole />
            )}
          </dd>
        </div>
      </dl>

      {!complete && expenseChange !== null ? (
        <p className="border-t border-rule px-4 py-2 text-[11px] leading-snug text-ink-3 sm:px-5">
          Comparisons are cut to the same day of the previous period, so a period still running is
          never measured against a finished one.
        </p>
      ) : null}
    </div>
  )
}
