import { useMemo, useState } from 'react'

import { Button, Field, Input, Modal, SegmentedPill, Select, Textarea } from '@/components/ui'
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
  { value: 'expense' as const, label: 'Spent', hint: 'Money leaving your accounts' },
  { value: 'income' as const, label: 'Received', hint: 'Money arriving' },
  {
    value: 'transfer' as const,
    label: 'Moved',
    hint: 'Between your own accounts — counts as neither',
  },
]

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
        toast.success('Transaction updated')
      } else {
        await add(payload)
        toast.success('Transaction added')
      }
      close()
    } catch (error) {
      toast.error(toMessage(error, 'Could not save the transaction.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={editing ? 'Edit transaction' : 'New transaction'}
      description={editing ? undefined : 'Money in, out, or moved between your accounts.'}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="entry-form" loading={submitting}>
            {editing ? 'Save' : 'Add'}
          </Button>
        </>
      }
    >
      <form id="entry-form" onSubmit={handleSubmit} className="flex flex-col gap-4 pb-2" noValidate>
        <SegmentedPill<TransactionType>
          label="Transaction type"
          value={values.type}
          onChange={setType}
          options={TYPE_OPTIONS}
          className="w-full"
        />
        {values.type === 'transfer' ? (
          <p className="rounded-[14px] bg-surface-2 px-3.5 py-2.5 text-[13px] leading-snug text-fg-muted">
            Moving money between your own accounts. It is left out of income, spending, budgets and
            your savings rate.
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
              leading={<span className="text-[18px] font-extrabold">{symbol}</span>}
              value={values.amount}
              onChange={(event) => setField('amount', event.target.value)}
              onBlur={() => blur('amount')}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              className="h-14 text-[22px] font-extrabold"
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
          label="Note"
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
