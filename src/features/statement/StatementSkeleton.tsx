import { LoadingRegion, Sheet, Skeleton, SkeletonRows } from '@/components/ui'

/** The ruled shape the statement will take, so nothing jumps when it lands. */
export function StatementSkeleton() {
  return (
    <LoadingRegion label="Reading the account">
      <div className="flex flex-col gap-4">
        <Sheet>
          <div className="border-b border-rule px-4 py-2.5 sm:px-5">
            <Skeleton className="h-3 w-40" />
          </div>
          <SkeletonRows rows={5} />
        </Sheet>

        <div className="grid gap-4 lg:grid-cols-2">
          <Sheet>
            <div className="border-b border-rule px-4 py-2.5 sm:px-5">
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="p-4 sm:p-5">
              <Skeleton className="h-44 w-full" />
            </div>
          </Sheet>
          <Sheet>
            <div className="border-b border-rule px-4 py-2.5 sm:px-5">
              <Skeleton className="h-3 w-32" />
            </div>
            <SkeletonRows rows={6} />
          </Sheet>
        </div>
      </div>
    </LoadingRegion>
  )
}
