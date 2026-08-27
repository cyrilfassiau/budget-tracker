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
  /** Gate for a loss that cannot be undone. */
  typeToConfirm?: string
  secondaryAction?: { label: string; onClick: () => void }
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

/** Cancel holds focus. A dialog that opens on the destructive button turns a
 *  stray Enter into data loss. */
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
      <div className="text-[15px] leading-relaxed text-fg-muted">{message}</div>

      {secondaryAction ? (
        <Button variant="ghost" className="mt-3" fullWidth onClick={secondaryAction.onClick}>
          {secondaryAction.label}
        </Button>
      ) : null}

      {typeToConfirm ? (
        <label className="mt-4 block">
          <span className="text-[13px] font-bold text-fg-muted">
            Type “{typeToConfirm}” to confirm
          </span>
          <Input
            className="mt-1.5"
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
