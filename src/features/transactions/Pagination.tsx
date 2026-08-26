import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/cn'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}

/** Windowed page numbers: 1 … 4 5 6 … 20. */
function pageWindow(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1])
  const sorted = [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b)

  return sorted.flatMap((value, index) => {
    const previous = sorted[index - 1]
    return previous !== undefined && value - previous > 1 ? ['gap' as const, value] : [value]
  })
}

export function Pagination({ page, totalPages, total, pageSize, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return (
      <p className="px-4 py-3 text-xs text-fg-subtle sm:px-5">
        {total} transaction{total === 1 ? '' : 's'}
      </p>
    )
  }

  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Transaction pages"
      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5"
    >
      <p className="text-xs text-fg-subtle">
        Showing <span className="tabular font-medium text-fg-muted">{first}–{last}</span> of{' '}
        <span className="tabular font-medium text-fg-muted">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="rounded-lg p-1.5 text-fg-muted transition-colors hover:bg-card-muted hover:text-fg disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronLeft className="size-4" />
        </button>

        {pageWindow(page, totalPages).map((entry, index) =>
          entry === 'gap' ? (
            <span key={`gap-${index}`} className="px-1 text-xs text-fg-subtle" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onChange(entry)}
              aria-label={`Page ${entry}`}
              aria-current={entry === page ? 'page' : undefined}
              className={cn(
                'tabular size-8 rounded-lg text-[13px] font-medium transition-colors',
                entry === page
                  ? 'bg-accent text-accent-fg'
                  : 'text-fg-muted hover:bg-card-muted hover:text-fg',
              )}
            >
              {entry}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className="rounded-lg p-1.5 text-fg-muted transition-colors hover:bg-card-muted hover:text-fg disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  )
}
