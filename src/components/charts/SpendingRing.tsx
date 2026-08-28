import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { useCurrencyFormat } from '@/store/useSettingsStore'
import { cn } from '@/lib/cn'
import type { CategoryTotal } from '@/utils/calculations'
import { formatMoney, formatPercent } from '@/utils/money'

interface SpendingRingProps {
  data: CategoryTotal[]
  total: number
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
      color: 'var(--category-none)',
      icon: 'circle',
      total: tail.reduce((sum, entry) => sum + entry.total, 0),
      share: tail.reduce((sum, entry) => sum + entry.share, 0),
      transactionCount: tail.reduce((sum, entry) => sum + entry.transactionCount, 0),
    },
  ]
}

export function SpendingRing({ data, total, maxSlices = 7 }: SpendingRingProps) {
  const { currency, locale } = useCurrencyFormat()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const slices = collapse(data, maxSlices)
  const active = activeIndex !== null ? slices[activeIndex] : null

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative size-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="total"
              nameKey="name"
              innerRadius="70%"
              outerRadius="100%"
              paddingAngle={slices.length > 1 ? 3 : 0}
              cornerRadius={6}
              strokeWidth={0}
              startAngle={90}
              endAngle={-270}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}

              isAnimationActive={false}
            >
              {slices.map((entry, index) => (
                <Cell
                  key={entry.categoryId}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.25}
                  style={{ transition: 'opacity 150ms' }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="max-w-[75%] truncate text-[12px] font-semibold text-fg-muted">
            {active ? active.name : 'Spent'}
          </span>
          <span className="figure text-[22px] font-extrabold text-fg">
            {formatMoney(active ? active.total : total, currency, locale, {
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>
      <ul className="flex w-full min-w-0 flex-col gap-0.5">
        {slices.map((entry, index) => (
          <li key={entry.categoryId}>
            <button
              type="button"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(null)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-[12px] px-2 py-1.5 text-left transition-colors',
                activeIndex === index ? 'bg-surface-2' : 'hover:bg-surface',
              )}
            >
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-fg">
                {entry.name}
              </span>
              <span className="figure text-[14px] font-bold text-fg">
                {formatMoney(entry.total, currency, locale, { maximumFractionDigits: 0 })}
              </span>
              <span className="figure w-9 shrink-0 text-right text-[12px] font-semibold text-fg-faint">
                {formatPercent(entry.share, locale)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
