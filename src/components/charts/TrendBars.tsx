import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

import { useCurrencyFormat } from '@/store/useSettingsStore'
import type { MonthlyPoint } from '@/utils/calculations'
import { formatMonthLabel } from '@/utils/dates'
import { formatMoney } from '@/utils/money'

export function TrendBars({ data, activeMonth }: { data: MonthlyPoint[]; activeMonth?: string }) {
  const { currency, locale } = useCurrencyFormat()

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="month"
            tickFormatter={(month: string) => formatMonthLabel(month, 'MMM')}
            tick={{ fill: 'var(--fg-faint)', fontSize: 12, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <Tooltip
            cursor={{ fill: 'var(--surface-2)', radius: 12 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const point = payload[0]!.payload as MonthlyPoint
              return (
                <div className="rounded-[14px] bg-fg px-3 py-2 text-bg shadow-lg">
                  <p className="text-[12px] font-bold opacity-70">
                    {formatMonthLabel(point.month)}
                    {point.partial ? ' · so far' : ''}
                  </p>
                  <p className="figure text-[15px] font-extrabold">
                    {formatMoney(point.expenses, currency, locale)}
                  </p>
                </div>
              )
            }}
          />
          <Bar dataKey="expenses" radius={[10, 10, 10, 10]} maxBarSize={30} isAnimationActive={false}>
            {data.map((point) => (
              <Cell
                key={point.month}
                fill={point.partial ? 'var(--surface-3)' : 'var(--accent)'}
                opacity={activeMonth && point.month === activeMonth ? 1 : 0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
