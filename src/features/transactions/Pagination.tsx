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

/** The foot of the sheet: which entries these are, out of how many. */
export function Pagination({ page, totalPages, total, pageSize, onChange }: PaginationProps) {
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Register pages"
      className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-5"
    >
      <p className="stamp text-ink-3">
        {total === 0
          ? 'No entries'
          : totalPages <= 1
            ? `${total} ${total === 1 ? 'entry' : 'entries'}`
            : `Entries ${first}–${last} of ${total}`}
      </p>

      {totalPages > 1 ? (
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
            className="p-1 text-ink-3 transition-colors hover:bg-sheet-alt hover:text-ink disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>

          {pageWindow(page, totalPages).map((entry, index) =>
            entry === 'gap' ? (
              <span key={`gap-${index}`} className="stamp px-0.5 text-ink-3" aria-hidden="true">
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
                  'figure size-6 text-[12px] transition-colors',
                  entry === page
                    ? 'bg-ink font-semibold text-sheet'
                    : 'text-ink-3 hover:bg-sheet-alt hover:text-ink',
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
            className="p-1 text-ink-3 transition-colors hover:bg-sheet-alt hover:text-ink disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      ) : null}
    </nav>
  )
}
