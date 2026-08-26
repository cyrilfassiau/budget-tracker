import { X } from 'lucide-react'
import { useCallback, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { useFocusTrap, useScrollLock } from '@/hooks/useFocusTrap'
import { cn } from '@/lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  /** Sticky action row at the bottom of the dialog. */
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /** Set to false for destructive flows where a stray click should not cancel. */
  closeOnBackdrop?: boolean
}

const SIZES = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
}

/**
 * Accessible dialog: focus is trapped while open, Escape closes it, the page
 * behind cannot scroll, and focus returns to the trigger on close.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const handleEscape = useCallback(() => onClose(), [onClose])

  useFocusTrap(panelRef, open, handleEscape)
  useScrollLock(open)

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 animate-fade-in bg-[rgb(8_11_18/0.55)] backdrop-blur-[2px]"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        className={cn(
          'relative z-10 flex max-h-[92dvh] w-full flex-col animate-scale-in',
          'rounded-t-2xl border border-border-base bg-card shadow-2xl sm:rounded-2xl',
          SIZES[size],
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border-base px-5 py-4">
          <div className="min-w-0">
            <h2 id="modal-title" className="text-base font-semibold tracking-tight text-fg">
              {title}
            </h2>
            {description ? (
              <p id="modal-description" className="mt-0.5 text-[13px] text-fg-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1 -mt-1 rounded-lg p-1.5 text-fg-subtle transition-colors hover:bg-card-muted hover:text-fg"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <footer className="flex items-center justify-end gap-2 border-t border-border-base px-5 py-3.5">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
