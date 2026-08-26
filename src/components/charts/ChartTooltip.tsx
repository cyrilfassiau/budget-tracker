import type { ReactNode } from 'react'

interface TooltipRow {
  label: string
  value: string
  color?: string
}

interface ChartTooltipProps {
  title: ReactNode
  rows: TooltipRow[]
  footer?: ReactNode
}

/**
 * Shared tooltip shell so every chart in the app speaks the same visual
 * language (Recharts' default tooltip ignores our theme tokens).
 */
export function ChartTooltip({ title, rows, footer }: ChartTooltipProps) {
  return (
    <div className="pointer-events-none min-w-40 rounded-xl border border-border-base bg-card p-2.5 shadow-lg">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
        {title}
      </p>
      <ul className="flex flex-col gap-1">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-4 text-[13px]">
            <span className="flex items-center gap-1.5 text-fg-muted">
              {row.color ? (
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
              ) : null}
              {row.label}
            </span>
            <span className="tabular font-semibold text-fg">{row.value}</span>
          </li>
        ))}
      </ul>
      {footer ? (
        <p className="mt-1.5 border-t border-border-base pt-1.5 text-[11px] text-fg-subtle">
          {footer}
        </p>
      ) : null}
    </div>
  )
}
