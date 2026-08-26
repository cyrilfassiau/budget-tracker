import { Card, LoadingRegion, Skeleton } from '@/components/ui'

/** Mirrors the dashboard layout so the page does not jump when data lands. */
export function DashboardSkeleton() {
  return (
    <LoadingRegion label="Loading your dashboard">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="size-8 rounded-xl" />
              </div>
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-16" />
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Card className="flex flex-col gap-4 lg:col-span-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </Card>
          <Card className="flex flex-col gap-4 lg:col-span-2">
            <Skeleton className="h-4 w-36" />
            <div className="flex items-center gap-5">
              <Skeleton className="size-40 shrink-0 rounded-full" />
              <div className="flex w-full flex-col gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-3 w-full" />
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} className="flex flex-col gap-4">
              <Skeleton className="h-4 w-32" />
              {Array.from({ length: 4 }).map((__, row) => (
                <div key={row} className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-xl" />
                  <Skeleton className="h-3 flex-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </Card>
          ))}
        </div>
      </div>
    </LoadingRegion>
  )
}
