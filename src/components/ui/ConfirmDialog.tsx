import { useState, type ReactNode } from 'react'

import { Button } from './Button'
import { Input } from './Input'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
  /**
   * When set, the confirm button stays disabled until this word is typed.
   * Reserved for losses that cannot be undone.
   */
  typeToConfirm?: string
  /** Offered beside Cancel — e.g. "Export a backup first". */
  secondaryAction?: { label: string; onClick: () => void }
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

/**
 * Cancel holds the focus, always. A dialog that opens with the destructive
 * button focused turns a stray Enter into data loss.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
  typeToConfirm,
  secondaryAction,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false)
  const [typed, setTyped] = useState('')

  // Clear the confirmation word each time the dialog opens, adjusting state
  // during render rather than in an effect.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setTyped('')
  }

  const unlocked = !typeToConfirm || typed.trim().toLowerCase() === typeToConfirm.toLowerCase()

  const handleConfirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onCancel}
      title={title}
      size="sm"
      closeOnBackdrop={false}
      footer={
        <>
          {secondaryAction ? (
            <Button variant="ghost" onClick={secondaryAction.onClick} disabled={busy}>
              {secondaryAction.label}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={onCancel} disabled={busy} data-autofocus>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            loading={busy}
            disabled={!unlocked}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-[13px] leading-relaxed text-ink-2">{message}</div>

      {typeToConfirm ? (
        <label className="mt-3 block">
          <span className="col-head text-ink-2">
            Type “{typeToConfirm}” to confirm
          </span>
          <Input
            className="mt-1"
            value={typed}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setTyped(event.target.value)}
          />
        </label>
      ) : null}
    </Modal>
  )
}
