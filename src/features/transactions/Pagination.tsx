import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/cn'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}

function pageWindow(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)
  const pages = new Set([1, totalPages, page, page - 1, page + 1])
  const sorted = [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b)
  return sorted.flatMap((value, index) => {
    const previous = sorted[index - 1]
    return previous !== undefined && value - previous > 1 ? ['gap' as const, value] : [value]
  })
}

export function Pagination({ page, totalPages, total, pageSize, onChange }: PaginationProps) {
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Transaction pages"
      className="flex flex-wrap items-center justify-between gap-2 pt-3"
    >
      <p className="text-[13px] font-semibold text-fg-faint">
        {total === 0
          ? 'Nothing to show'
          : totalPages <= 1
            ? `${total} transaction${total === 1 ? '' : 's'}`
            : `${first}–${last} of ${total}`}
      </p>
      {totalPages > 1 ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
            className="flex size-8 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          {pageWindow(page, totalPages).map((entry, index) =>
            entry === 'gap' ? (
              <span key={`gap-${index}`} className="px-0.5 text-fg-faint" aria-hidden="true">
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
                  'figure size-8 rounded-full text-[13px] font-bold transition-colors',
                  entry === page
                    ? 'bg-accent text-accent-fg'
                    : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
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
            className="flex size-8 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      ) : null}
    </nav>
  )
}
