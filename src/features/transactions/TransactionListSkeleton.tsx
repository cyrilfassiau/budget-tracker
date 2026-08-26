import { LoadingRegion, Skeleton } from '@/components/ui'

export function TransactionListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <LoadingRegion label="Loading transactions">
      <ul className="divide-y divide-[var(--border)]">
        {Array.from({ length: rows }).map((_, index) => (
          <li key={index} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
            <Skeleton className="size-9 rounded-xl" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-3 w-40 max-w-full" />
              <Skeleton className="h-2.5 w-24" />
            </div>
            <Skeleton className="h-3 w-16" />
          </li>
        ))}
      </ul>
    </LoadingRegion>
  )
}
