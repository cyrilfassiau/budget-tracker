import { useId, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface FieldProps {
  label: string
  htmlFor?: string
  error?: string
  hint?: ReactNode
  required?: boolean
  className?: string
  children: (ids: {
    id: string
    describedBy: string | undefined
    invalid: boolean
    required: boolean
  }) => ReactNode
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  className,
  children,
}: FieldProps) {
  const generatedId = useId()
  const id = htmlFor ?? generatedId
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[13px] font-bold text-fg-muted">
        {label}
        {/* The control carries `required`; this marker is for sighted readers. */}
        {required ? (
          <span aria-hidden="true" className="ml-1 font-medium text-fg-faint">
            required
          </span>
        ) : null}
      </label>

      {children({ id, describedBy, invalid: Boolean(error), required })}

      {hint && !error ? (
        <p id={hintId} className="text-[12px] leading-snug text-fg-faint">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="text-[12px] font-semibold leading-snug text-negative">
          {error}
        </p>
      ) : null}
    </div>
  )
}
