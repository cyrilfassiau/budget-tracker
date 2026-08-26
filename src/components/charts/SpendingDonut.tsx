import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { useCurrencyFormat } from '@/store/useSettingsStore'
import type { CategoryTotal } from '@/utils/calculations'
import { formatMoney, formatPercent } from '@/utils/money'

import { ChartTooltip } from './ChartTooltip'

interface SpendingDonutProps {
  data: CategoryTotal[]
  total: number
  /** Slices beyond this count are merged into "Other". */
  maxSlices?: number
}

function collapse(data: CategoryTotal[], maxSlices: number): CategoryTotal[] {
  if (data.length <= maxSlices) return data
  const head = data.slice(0, maxSlices - 1)
  const tail = data.slice(maxSlices - 1)
  return [
    ...head,
    {
      categoryId: '__other__',
      name: `Other (${tail.length})`,
      color: '#94a3b8',
      icon: 'circle',
      total: tail.reduce((sum, entry) => sum + entry.total, 0),
      share: tail.reduce((sum, entry) => sum + entry.share, 0),
      transactionCount: tail.reduce((sum, entry) => sum + entry.transactionCount, 0),
    },
  ]
}

/**
 * Donut of spending by category with the month total in the middle — the
 * centre label is what makes a donut more useful than a pie here.
 */
export function SpendingDonut({ data, total, maxSlices = 7 }: SpendingDonutProps) {
  const { currency, locale } = useCurrencyFormat()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const slices = collapse(data, maxSlices)
  const active = activeIndex !== null ? slices[activeIndex] : null

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div className="relative size-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="total"
              nameKey="name"
              innerRadius="64%"
              outerRadius="100%"
              paddingAngle={slices.length > 1 ? 2 : 0}
              strokeWidth={0}
              startAngle={90}
              endAngle={-270}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              isAnimationActive
              animationDuration={520}
            >
              {slices.map((entry, index) => (
                <Cell
                  key={entry.categoryId}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                  style={{ transition: 'opacity 150ms' }}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active: isActive, payload }) => {
                if (!isActive || !payload?.length) return null
                const entry = payload[0]!.payload as CategoryTotal
                return (
                  <ChartTooltip
                    title={entry.name}
                    rows={[
                      { label: 'Spent', value: formatMoney(entry.total, currency, locale) },
                      { label: 'Share', value: formatPercent(entry.share, locale) },
                    ]}
                    footer={`${entry.transactionCount} transaction${entry.transactionCount === 1 ? '' : 's'}`}
                  />
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-medium uppercase tracking-wide text-fg-subtle">
            {active ? active.name : 'Total spent'}
          </span>
          <span className="tabular text-lg font-semibold tracking-tight text-fg">
            {formatMoney(active ? active.total : total, currency, locale, {
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>

      <ul className="flex w-full min-w-0 flex-col gap-1.5">
        {slices.map((entry, index) => (
          <li
            key={entry.categoryId}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-card-muted"
          >
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="min-w-0 flex-1 truncate text-[13px] text-fg-muted">{entry.name}</span>
            <span className="tabular text-[13px] font-medium text-fg">
              {formatMoney(entry.total, currency, locale, { maximumFractionDigits: 0 })}
            </span>
            <span className="tabular w-10 shrink-0 text-right text-[11px] text-fg-subtle">
              {formatPercent(entry.share, locale)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
