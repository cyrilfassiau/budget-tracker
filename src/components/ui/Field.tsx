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

/**
 * Column head above a ruled field. `required` reaches the control itself, so
 * assistive tech learns it before a failed submit rather than after one.
 */
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
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="col-head text-ink-2">
        {label}
        {/* The control carries `required`, so this marker is for sighted
            readers only — in the accessible name it just muddies the label. */}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-red">
            required
          </span>
        ) : null}
      </label>

      {children({ id, describedBy, invalid: Boolean(error), required })}

      {hint && !error ? (
        <p id={hintId} className="text-[11px] leading-snug text-ink-3">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="text-[11px] font-semibold leading-snug text-red">
          {error}
        </p>
      ) : null}
    </div>
  )
}
