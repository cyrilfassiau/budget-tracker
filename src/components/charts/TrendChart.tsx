import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useCurrencyFormat } from '@/store/useSettingsStore'
import type { MonthlyPoint } from '@/utils/calculations'
import { formatMonthLabel } from '@/utils/dates'
import { formatMoney, formatMoneyCompact } from '@/utils/money'

/**
 * Six periods of paid in against paid out.
 *
 * The period still in progress is hatched rather than drawn solid: a partial
 * bar sitting flush beside five complete ones is the single most misleading
 * mark a budget app can print.
 */
export function TrendChart({ data, activeMonth }: { data: MonthlyPoint[]; activeMonth?: string }) {
  const { currency, locale } = useCurrencyFormat()

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: -14 }} barGap={2}>
          <defs>
            {/* Hatching marks a period that has not finished. */}
            <pattern id="partial-out" width="5" height="5" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <rect width="5" height="5" fill="var(--sheet)" />
              <line x1="0" y1="0" x2="0" y2="5" stroke="var(--ink)" strokeWidth="2.5" />
            </pattern>
            <pattern id="partial-in" width="5" height="5" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <rect width="5" height="5" fill="var(--sheet)" />
              <line x1="0" y1="0" x2="0" y2="5" stroke="var(--carbon)" strokeWidth="2.5" />
            </pattern>
          </defs>

          <CartesianGrid vertical={false} stroke="var(--rule)" />

          <XAxis
            dataKey="month"
            tickFormatter={(month: string) => formatMonthLabel(month, 'MMM').toUpperCase()}
            tick={{ fill: 'var(--ink-3)', fontSize: 10, letterSpacing: '0.06em' }}
            axisLine={{ stroke: 'var(--rule-strong)' }}
            tickLine={false}
            dy={4}
          />
          <YAxis
            tickFormatter={(value: number) => formatMoneyCompact(value, currency, locale)}
            tick={{ fill: 'var(--ink-3)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={58}
          />

          <ReferenceLine y={0} stroke="var(--ink)" />

          <Tooltip
            cursor={{ fill: 'var(--sheet-alt)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const point = payload[0]!.payload as MonthlyPoint
              return (
                <div className="min-w-44 border border-ink bg-sheet p-2">
                  <p className="col-head mb-1 text-ink">
                    {formatMonthLabel(point.month)}
                    {point.partial ? ' · in progress' : ''}
                  </p>
                  <dl className="flex flex-col gap-0.5 text-[12px]">
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-3">Paid in</dt>
                      <dd className="figure text-ink">{formatMoney(point.income, currency, locale)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-3">Paid out</dt>
                      <dd className="figure text-ink">{formatMoney(point.expenses, currency, locale)}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-rule pt-0.5">
                      <dt className="text-ink-3">Net</dt>
                      <dd className={`figure font-semibold ${point.net < 0 ? 'dr' : 'text-ink'}`}>
                        {formatMoney(point.net, currency, locale)}
                      </dd>
                    </div>
                  </dl>
                </div>
              )
            }}
          />

          {/* Animations stay off: Recharts does not settle them under React 19's
              StrictMode double-render, which leaves bars stuck flat. */}
          <Bar dataKey="income" name="Paid in" maxBarSize={16} isAnimationActive={false}>
            {data.map((point) => (
              <Cell
                key={point.month}
                fill={point.partial ? 'url(#partial-in)' : 'var(--carbon)'}
                stroke={point.partial ? 'var(--carbon)' : undefined}
              />
            ))}
          </Bar>
          <Bar dataKey="expenses" name="Paid out" maxBarSize={16} isAnimationActive={false}>
            {data.map((point) => (
              <Cell
                key={point.month}
                fill={point.partial ? 'url(#partial-out)' : 'var(--ink)'}
                stroke={point.partial ? 'var(--ink)' : undefined}
                opacity={activeMonth && point.month === activeMonth ? 1 : 0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Key for the chart, including what the hatching means. */
export function TrendKey() {
  return (
    <ul className="flex flex-wrap items-center gap-3">
      <li className="flex items-center gap-1.5 text-[11px] text-ink-3">
        <span aria-hidden="true" className="h-2.5 w-2 bg-carbon" />
        Paid in
      </li>
      <li className="flex items-center gap-1.5 text-[11px] text-ink-3">
        <span aria-hidden="true" className="h-2.5 w-2 bg-ink" />
        Paid out
      </li>
      <li className="flex items-center gap-1.5 text-[11px] text-ink-3">
        <span
          aria-hidden="true"
          className="h-2.5 w-2 border border-ink"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, var(--ink) 0 1px, var(--sheet) 1px 3px)',
          }}
        />
        In progress
      </li>
    </ul>
  )
}
