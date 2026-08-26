import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/cn'
import {
  TOAST_DURATION,
  useToastStore,
  type Toast as ToastModel,
} from '@/store/useToastStore'

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const TONES = {
  success: 'text-income',
  error: 'text-expense',
  info: 'text-accent',
}

function Toast({ toast }: { toast: ToastModel }) {
  const dismiss = useToastStore((state) => state.dismiss)
  const Icon = ICONS[toast.variant]

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), TOAST_DURATION)
    return () => clearTimeout(timer)
  }, [toast.id, dismiss])

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 animate-toast-in',
        'rounded-xl border border-border-base bg-card p-3 pr-2 shadow-lg',
      )}
    >
      <Icon className={cn('mt-0.5 size-4.5 shrink-0', TONES[toast.variant])} aria-hidden="true" />

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-fg">{toast.message}</p>
        {toast.description ? (
          <p className="mt-0.5 text-xs text-fg-muted">{toast.description}</p>
        ) : null}
        {toast.action ? (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick()
              dismiss(toast.id)
            }}
            className="mt-1.5 text-xs font-semibold text-accent hover:underline"
          >
            {toast.action.label}
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss notification"
        className="rounded-md p-1 text-fg-subtle transition-colors hover:bg-card-muted hover:text-fg"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

/** Live region so screen readers announce create/update/delete results. */
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts)

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-atomic="false"
      className={cn(
        'pointer-events-none fixed z-[60] flex w-[calc(100%-2rem)] flex-col gap-2',
        'bottom-4 left-4 sm:left-auto sm:right-4 sm:w-80',
      )}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body,
  )
}
