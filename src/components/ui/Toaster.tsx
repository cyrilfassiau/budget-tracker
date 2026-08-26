import { X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/cn'
import { TOAST_DURATION, useToastStore, type Toast as ToastModel } from '@/store/useToastStore'

/**
 * A receipt slip printed at the foot of the page. No icon set, no colour
 * coding beyond the ledger's one rule: trouble is red.
 */
function Toast({ toast }: { toast: ToastModel }) {
  const dismiss = useToastStore((state) => state.dismiss)

  useEffect(() => {
    // An undo offer must outlast a glance at the screen.
    const timer = setTimeout(() => dismiss(toast.id), toast.action ? TOAST_DURATION * 2 : TOAST_DURATION)
    return () => clearTimeout(timer)
  }, [toast.id, toast.action, dismiss])

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 animate-in border bg-sheet px-3 py-2.5',
        toast.variant === 'error' ? 'border-red' : 'border-ink',
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'font-narrow text-[12px] font-semibold uppercase tracking-[0.07em]',
            toast.variant === 'error' ? 'text-red' : 'text-ink',
          )}
        >
          {toast.message}
        </p>
        {toast.description ? (
          <p className="mt-0.5 text-[12px] leading-snug text-ink-2">{toast.description}</p>
        ) : null}
        {toast.action ? (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick()
              dismiss(toast.id)
            }}
            className="mt-1.5 font-narrow text-[12px] font-semibold uppercase tracking-[0.07em] text-carbon underline underline-offset-4 hover:text-ink"
          >
            {toast.action.label}
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss"
        className="-mr-1 -mt-0.5 p-1 text-ink-3 transition-colors hover:bg-sheet-alt hover:text-ink"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts)

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-3 left-3 z-[60] flex w-[calc(100%-1.5rem)] flex-col gap-2 sm:left-auto sm:right-3 sm:w-80"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body,
  )
}
