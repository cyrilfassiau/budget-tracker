import { Amount, CategoryMark, EmptyState } from '@/components/ui'
import { useCurrencyFormat } from '@/store/useSettingsStore'
import type { CategoryTotal } from '@/utils/calculations'
import { formatPercent } from '@/utils/money'

/**
 * The analysis column, the way an analysis book actually does it: payments
 * ranked, each with its share, ruled into the sheet.
 *
 * This replaces the donut deliberately. A donut of seven near-identical wedges
 * asks the reader to compare areas and match colours to a legend in order to
 * learn something a ranked column simply states — and it forced category
 * colour into a palette where colour already means trouble.
 */
export function AnalysisTable({
  rows,
  total,
  limit = 8,
}: {
  rows: CategoryTotal[]
  total: number
  limit?: number
}) {
  const { locale } = useCurrencyFormat()

  if (rows.length === 0) {
    return (
      <EmptyState
        size="sm"
        title="Nothing paid out"
        description="Payments you record are analysed here by category."
      />
    )
  }

  const shown = rows.slice(0, limit)
  const rest = rows.slice(limit)
  const restTotal = rest.reduce((sum, entry) => sum + entry.total, 0)
  const largest = shown[0]?.total ?? 1

  return (
    <table className="w-full">
      <caption className="sr-only">Payments by category</caption>
      <thead>
        <tr className="border-b border-rule">
          <th scope="col" className="col-head py-1.5 pl-4 pr-2 text-left sm:pl-5">
            Category
          </th>
          <th scope="col" className="col-head px-2 py-1.5 text-right">
            Amount
          </th>
          <th scope="col" className="col-head py-1.5 pl-2 pr-4 text-right sm:pr-5">
            Share
          </th>
        </tr>
      </thead>

      <tbody>
        {shown.map((row) => (
          <tr key={row.categoryId} className="border-b border-rule last:border-0">
            <td className="py-1.5 pl-4 pr-2 sm:pl-5">
              <div className="flex items-center gap-2">
                <CategoryMark icon={row.icon} size="sm" />
                <span className="min-w-0 truncate text-[13px] text-ink">{row.name}</span>
              </div>
              {/* The proportion, drawn in ink under the name rather than as a wedge. */}
              <div
                aria-hidden="true"
                className="mt-1 h-px bg-ink-3"
                style={{ width: `${Math.max(2, (row.total / largest) * 100)}%` }}
              />
            </td>
            <td className="whitespace-nowrap px-2 py-1.5 text-right align-top text-[13px] text-ink">
              <Amount value={row.total} plain />
            </td>
            <td className="figure whitespace-nowrap py-1.5 pl-2 pr-4 text-right align-top text-[12px] text-ink-3 sm:pr-5">
              {formatPercent(row.share, locale)}
            </td>
          </tr>
        ))}

        {rest.length > 0 ? (
          <tr className="border-b border-rule last:border-0">
            <td className="py-1.5 pl-4 pr-2 text-[13px] text-ink-3 sm:pl-5">
              {rest.length} further {rest.length === 1 ? 'category' : 'categories'}
            </td>
            <td className="whitespace-nowrap px-2 py-1.5 text-right text-[13px] text-ink-3">
              <Amount value={restTotal} plain />
            </td>
            <td className="figure whitespace-nowrap py-1.5 pl-2 pr-4 text-right text-[12px] text-ink-3 sm:pr-5">
              {formatPercent(total > 0 ? restTotal / total : 0, locale)}
            </td>
          </tr>
        ) : null}
      </tbody>

      <tfoot>
        <tr className="border-t-2 border-ink">
          <td className="col-head py-1.5 pl-4 pr-2 sm:pl-5">Total paid out</td>
          <td className="whitespace-nowrap px-2 py-1.5 text-right text-[13px] font-semibold text-ink">
            <Amount value={total} plain />
          </td>
          <td className="py-1.5 pl-2 pr-4 sm:pr-5" />
        </tr>
      </tfoot>
    </table>
  )
}
