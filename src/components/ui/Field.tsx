import { useId, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface FieldProps {
  label: string
  /** Supplied by the caller when it needs to control the input's id. */
  htmlFor?: string
  error?: string
  hint?: ReactNode
  required?: boolean
  className?: string
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode
}

/**
 * Wires up label / hint / error text and the aria attributes that connect
 * them, so no form control in the app is left unlabelled.
 */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: FieldProps) {
  const generatedId = useId()
  const id = htmlFor ?? generatedId
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-fg">
        {label}
        {required ? (
          <span className="ml-0.5 text-expense" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {children({ id, describedBy, invalid: Boolean(error) })}

      {hint && !error ? (
        <p id={hintId} className="text-xs text-fg-subtle">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-expense">
          {error}
        </p>
      ) : null}
    </div>
  )
}
