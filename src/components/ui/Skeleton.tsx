import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('shimmer', className)} />
}

/** Ruled rows waiting for their figures — the shape the register will take. */
export function SkeletonRows({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('divide-y divide-[var(--rule)]', className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
          <Skeleton className="h-2.5 w-14" />
          <Skeleton className="h-2.5 flex-1" />
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="hidden h-2.5 w-20 sm:block" />
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
