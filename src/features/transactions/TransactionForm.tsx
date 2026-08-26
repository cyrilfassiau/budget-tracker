import { useMemo, useState } from 'react'

import { Button, Field, Input, Modal, Select, Textarea, TypePicker } from '@/components/ui'
import { CURRENCIES } from '@/lib/constants'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { toMessage, toast } from '@/store/useToastStore'
import { useTransactionModal } from '@/store/useTransactionModal'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useUIStore } from '@/store/useUIStore'
import type { TransactionType } from '@/types'
import { currentMonthKey, monthBounds, toDateKey } from '@/utils/dates'
import {
  MAX_NOTE_LENGTH,
  hasErrors,
  toTransactionPayload,
  validateTransaction,
  type FieldErrors,
  type TransactionFormValues,
} from '@/utils/validation'

/**
 * A new entry lands in the period the user is looking at.
 *
 * Defaulting to today looks harmless until someone opens an empty March, is
 * told to add an entry, does exactly that, and watches March stay empty.
 */
function defaultDateFor(month: string): string {
  const today = new Date()
  if (month === currentMonthKey(today)) return toDateKey(today)
  const { from, to } = monthBounds(month)
  return to < toDateKey(today) ? to : from
}

function emptyValues(month: string, overrides: Partial<TransactionFormValues> = {}) {
  return {
    amount: '',
    type: 'expense' as TransactionType,
    categoryId: '',
    date: defaultDateFor(month),
    note: '',
    ...overrides,
  }
}

const TYPE_OPTIONS = [
  { value: 'expense' as const, label: 'Paid out', hint: 'Money leaving your accounts' },
  { value: 'income' as const, label: 'Paid in', hint: 'Money arriving' },
  {
    value: 'transfer' as const,
    label: 'Transfer',
    hint: 'Between your own accounts — counts as neither',
  },
]

/**
 * The entry slip. Validation runs on submit, then live per field once that
 * field has been touched, so no error appears while typing a first character.
 */
export function TransactionForm() {
  const { open, editing, defaults, close } = useTransactionModal()
  const month = useUIStore((state) => state.selectedMonth)
  const categories = useCategoriesStore((state) => state.items)
  const add = useTransactionsStore((state) => state.add)
  const edit = useTransactionsStore((state) => state.edit)
  const allowFutureDates = useSettingsStore((state) => state.allowFutureDates)
  const currency = useSettingsStore((state) => state.currency)

  const [values, setValues] = useState<TransactionFormValues>(() => emptyValues(month))
  const [errors, setErrors] = useState<FieldErrors<TransactionFormValues>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)

  const symbol = CURRENCIES.find((entry) => entry.code === currency)?.symbol ?? currency

  const availableCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.kind === values.type || category.kind === 'both',
      ),
    [categories, values.type],
  )

  // Re-seed when the slip opens on a different subject. Adjusting state during
  // render is cheaper than an effect and the stale values never reach the DOM.
  const instance = open ? (editing?.id ?? `new:${month}`) : 'closed'
  const [renderedInstance, setRenderedInstance] = useState(instance)

  if (instance !== renderedInstance) {
    setRenderedInstance(instance)
    setErrors({})
    setTouched({})
    setValues(
      editing
        ? {
            amount: String(editing.amount),
            type: editing.type,
            categoryId: editing.categoryId,
            date: editing.date,
            note: editing.note,
          }
        : emptyValues(month, defaults ?? {}),
    )
  }

  const setField = <K extends keyof TransactionFormValues>(
    key: K,
    value: TransactionFormValues[K],
  ) => {
    const next = { ...values, [key]: value }
    setValues(next)
    if (touched[key]) setErrors(validateTransaction(next, { allowFutureDates }))
  }

  /** Switching type can strand a category that no longer applies to it. */
  const setType = (type: TransactionType) => {
    const stillValid = categories.some(
      (entry) => entry.id === values.categoryId && (entry.kind === type || entry.kind === 'both'),
    )
    setValues({ ...values, type, categoryId: stillValid ? values.categoryId : '' })
  }

  const blur = (key: keyof TransactionFormValues) => {
    setTouched((current) => ({ ...current, [key]: true }))
    setErrors(validateTransaction(values, { allowFutureDates }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors = validateTransaction(values, { allowFutureDates })
    setErrors(nextErrors)
    setTouched({ amount: true, categoryId: true, date: true, note: true })
    if (hasErrors(nextErrors)) return

    setSubmitting(true)
    try {
      const payload = toTransactionPayload(values)
      if (editing) {
        await edit(editing.id, payload)
        toast.success('Entry updated')
      } else {
        await add(payload)
        toast.success('Entry recorded')
      }
      close()
    } catch (error) {
      toast.error(toMessage(error, 'Could not record the entry.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={editing ? 'Amend entry' : 'New entry'}
      description={editing ? undefined : 'Record money in, out, or moved.'}
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="entry-form" loading={submitting}>
            {editing ? 'Save' : 'Record'}
          </Button>
        </>
      }
    >
      <form id="entry-form" onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
        <TypePicker<TransactionType>
          label="Entry type"
          value={values.type}
          onChange={setType}
          options={TYPE_OPTIONS}
        />

        {values.type === 'transfer' ? (
          <p className="border border-rule bg-sheet-alt px-2.5 py-1.5 text-[11px] leading-snug text-ink-2">
            A transfer moves money between your own accounts. It is left out of paid in, paid out,
            budgets and the savings rate.
          </p>
        ) : null}

        <Field label="Amount" error={errors.amount} required>
          {({ id, describedBy, invalid, required }) => (
            <Input
              id={id}
              name="amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              required={required}
              leading={<span className="text-[12px] font-semibold">{symbol}</span>}
              value={values.amount}
              onChange={(event) => setField('amount', event.target.value)}
              onBlur={() => blur('amount')}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              className="text-[15px] font-semibold"
              data-autofocus
            />
          )}
        </Field>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Category" error={errors.categoryId} required>
            {({ id, describedBy, invalid, required }) => (
              <Select
                id={id}
                name="categoryId"
                required={required}
                value={values.categoryId}
                onChange={(event) => setField('categoryId', event.target.value)}
                onBlur={() => blur('categoryId')}
                aria-describedby={describedBy}
                aria-invalid={invalid}
              >
                <option value="">Choose…</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field
            label="Date"
            error={errors.date}
            required
            hint={allowFutureDates ? 'Planning is on: future dates allowed.' : undefined}
          >
            {({ id, describedBy, invalid, required }) => (
              <Input
                id={id}
                name="date"
                type="date"
                required={required}
                value={values.date}
                max={allowFutureDates ? undefined : toDateKey(new Date())}
                onChange={(event) => setField('date', event.target.value)}
                onBlur={() => blur('date')}
                aria-describedby={describedBy}
                aria-invalid={invalid}
              />
            )}
          </Field>
        </div>

        <Field
          label="Particulars"
          error={errors.note}
          hint={
            values.note.length > MAX_NOTE_LENGTH - 30
              ? `${values.note.length} of ${MAX_NOTE_LENGTH} characters`
              : undefined
          }
        >
          {({ id, describedBy, invalid }) => (
            <Textarea
              id={id}
              name="note"
              placeholder="What was it for?"
              value={values.note}
              onChange={(event) => setField('note', event.target.value)}
              onBlur={() => blur('note')}
              aria-describedby={describedBy}
              aria-invalid={invalid}
            />
          )}
        </Field>
      </form>
    </Modal>
  )
}
