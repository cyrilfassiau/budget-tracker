import { Card, LoadingRegion, Skeleton, SkeletonRows } from '@/components/ui'

export function OverviewSkeleton() {
  return (
    <LoadingRegion label="Loading your account">
      <div className="flex flex-col gap-4">
        <Card className="flex flex-col gap-5">
          <div>
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="mt-2 h-12 w-56 max-w-full" />
            <Skeleton className="mt-2.5 h-3.5 w-44" />
          </div>
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="size-14 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="flex flex-col gap-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-5">
              <Skeleton className="size-44 shrink-0 rounded-full" />
              <div className="flex w-full flex-col gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-3.5 w-full" />
                ))}
              </div>
            </div>
          </Card>
          <Card className="flex flex-col gap-3">
            <Skeleton className="h-4 w-32" />
            <SkeletonRows rows={5} />
          </Card>
        </div>
      </div>
    </LoadingRegion>
  )
}
