import { Skeleton } from '@/components/ui'

/** Shown while a lazily-loaded route chunk is downloading. */
export function RouteFallback() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading page" className="flex min-h-dvh bg-bg">
      <div className="hidden w-60 shrink-0 border-r border-border-base bg-card lg:block" />
      <div className="min-w-0 flex-1">
        <div className="h-16 border-b border-border-base" />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 sm:px-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
