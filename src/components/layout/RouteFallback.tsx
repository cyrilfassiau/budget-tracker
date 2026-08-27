import { Skeleton } from '@/components/ui'

export function RouteFallback() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading" className="flex min-h-dvh bg-bg">
      <div className="hidden w-60 shrink-0 lg:block" />
      <div className="min-w-0 flex-1">
        <div className="px-4 py-3 sm:px-6">
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 sm:px-6 lg:max-w-5xl">
          <Skeleton className="h-44 w-full rounded-[20px]" />
          <Skeleton className="h-64 w-full rounded-[20px]" />
        </div>
      </div>
    </div>
  )
}
