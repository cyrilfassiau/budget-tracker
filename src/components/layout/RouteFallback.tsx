import { Skeleton } from '@/components/ui'

/** Shown while a route chunk downloads. */
export function RouteFallback() {
  return (
    <div role="status" aria-busy="true" aria-label="Turning the page" className="flex min-h-dvh bg-paper">
      <div className="hidden w-52 shrink-0 border-r border-rule bg-sheet lg:block" />
      <div className="min-w-0 flex-1">
        <div className="h-[86px] border-b border-rule" />
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
      </div>
    </div>
  )
}
