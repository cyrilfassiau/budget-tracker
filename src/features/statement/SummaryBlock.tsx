import { Amount } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { StatementData } from '@/hooks/useStatement'
import { useCurrencyFormat } from '@/store/useSettingsStore'
import { formatMoney, formatPercent } from '@/utils/money'

interface LineProps {
  label: string
  value: number
  note?: string
  /** The two figures the arithmetic resolves to. */
  weight?: 'net' | 'total'
  plain?: boolean
}

function Line({ label, value, note, weight, plain }: LineProps) {
  return (
    <tr className={cn('border-t border-rule', weight === 'total' && 'border-t-2 border-ink')}>
      <th
        scope="row"
        className={cn(
          'py-2 pl-4 pr-2 text-left align-middle font-normal sm:pl-5',
          weight ? 'col-head text-ink' : 'text-[13px] text-ink-2',
        )}
      >
        {label}
      </th>
      <td className="hidden py-2 pr-2 align-middle text-[11px] text-ink-3 sm:table-cell">{note}</td>
      <td
        className={cn(
          'whitespace-nowrap py-2 pl-2 pr-4 text-right align-middle sm:pr-5',
          weight === 'total'
            ? 'font-narrow text-[30px] font-bold leading-none tracking-[-0.01em] sm:text-[38px]'
            : weight === 'net'
              ? 'text-[15px] font-semibold'
              : 'text-[13px]',
        )}
      >
        <Amount value={value} plain={plain} />
      </td>
    </tr>
  )
}

/**
 * The passbook's account summary: one arithmetic the reader can follow down a
 * shared decimal and check — brought forward, what moved, what is left.
 *
 * It replaces the row of stat cards, so it must not quietly grow one back: the
 * derived figures that used to sit under it restated the elapsed rule the head
 * already carries, and carried forward is the number the page is for.
 */
export function SummaryBlock({ data }: { data: StatementData }) {
  const { currency, locale } = useCurrencyFormat()
  const { summary, previousSummary, complete, elapsed } = data

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
          <Line
            label="Net this period"
            value={summary.net}
            weight="net"
            note={
              summary.savingsRate === null
                ? 'No income recorded this period'
                : `${formatPercent(summary.savingsRate, locale)} of income kept`
            }
          />
          <Line label="Carried forward" value={data.carriedForward} weight="total" />
        </tbody>
      </table>

      {!complete ? (
        <p className="border-t border-rule px-4 py-2 text-[11px] leading-snug text-ink-3 sm:px-5">
          {summary.savingsRate === null ? null : (
            <span className="sm:hidden">
              {formatPercent(summary.savingsRate, locale)} of income kept.{' '}
            </span>
          )}
          Comparisons are cut to the same day of the previous period, so a period still running is
          never measured against a finished one.
        </p>
      ) : null}
    </div>
  )
}
