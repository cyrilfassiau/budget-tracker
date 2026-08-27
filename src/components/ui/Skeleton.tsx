import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('shimmer rounded-xl', className)} />
}

/** Avatar rows waiting for their figures — the shape the list will take. */
export function SkeletonRows({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-1 py-2.5">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3 w-32 max-w-full" />
            <Skeleton className="h-2.5 w-20" />
          </div>
          <Skeleton className="h-3.5 w-16" />
        </div>
      ))}
    </div>
  )
}

export function LoadingRegion({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      {children}
      <span className="sr-only">{label}</span>
    </div>
  )
}
