import { cn } from '@/lib/cn'

interface SkeletonProps {
  className?: string
}

/** Placeholder block used while a service call is in flight. */
export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden="true" className={cn('shimmer rounded-lg', className)} />
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-3', index === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  )
}

/** Wraps a loading region so assistive tech is told something is coming. */
export function LoadingRegion({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      {children}
      <span className="sr-only">{label}</span>
    </div>
  )
}
