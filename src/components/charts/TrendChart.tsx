import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useCurrencyFormat } from '@/store/useSettingsStore'
import type { MonthlyPoint } from '@/utils/calculations'
import { formatMonthLabel } from '@/utils/dates'
import { formatMoney, formatMoneyCompact, formatSigned } from '@/utils/money'

import { ChartTooltip } from './ChartTooltip'

interface TrendChartProps {
  data: MonthlyPoint[]
  /** Highlights the month currently selected elsewhere in the app. */
  activeMonth?: string
}

/**
 * Income vs. expenses over the last six months, with net as an overlaid line —
 * bars answer "how much", the line answers "am I ahead or behind".
 */
export function TrendChart({ data, activeMonth }: TrendChartProps) {
  const { currency, locale } = useCurrencyFormat()

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />

          <XAxis
            dataKey="month"
            tickFormatter={(month: string) => formatMonthLabel(month, 'MMM')}
            tick={{ fill: 'var(--fg-subtle)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            dy={4}
          />
          <YAxis
            tickFormatter={(value: number) => formatMoneyCompact(value, currency, locale)}
            tick={{ fill: 'var(--fg-subtle)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={64}
          />

          <Tooltip
            cursor={{ fill: 'var(--card-muted)', radius: 8 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const point = payload[0]!.payload as MonthlyPoint
              return (
                <ChartTooltip
                  title={formatMonthLabel(point.month)}
                  rows={[
                    {
                      label: 'Income',
                      value: formatMoney(point.income, currency, locale),
                      color: 'var(--income)',
                    },
                    {
                      label: 'Expenses',
                      value: formatMoney(point.expenses, currency, locale),
                      color: 'var(--expense)',
                    },
                    {
                      label: 'Net',
                      value: formatSigned(point.net, currency, locale),
                      color: 'var(--accent)',
                    },
                  ]}
                />
              )
            }}
          />

          {/* Entry animations are off across the app's charts: Recharts does not
              settle them reliably under React 19's StrictMode double-render and
              leaves bars flat and pie slices as slivers. */}
          <Bar
            dataKey="income"
            name="Income"
            fill="var(--income)"
            radius={[4, 4, 0, 0]}
            maxBarSize={22}
            opacity={activeMonth ? 0.9 : 1}
            isAnimationActive={false}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            fill="var(--expense)"
            radius={[4, 4, 0, 0]}
            maxBarSize={22}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="net"
            name="Net"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={{ r: 2.5, strokeWidth: 0, fill: 'var(--accent)' }}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Small legend rendered next to the chart title. */
export function TrendLegend() {
  const items = [
    { label: 'Income', color: 'var(--income)' },
    { label: 'Expenses', color: 'var(--expense)' },
    { label: 'Net', color: 'var(--accent)' },
  ]

  return (
    <ul className="flex items-center gap-3">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-[11px] text-fg-muted">
          <span
            aria-hidden="true"
            className="size-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
