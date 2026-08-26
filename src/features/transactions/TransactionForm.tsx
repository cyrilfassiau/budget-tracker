import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  Button,
  Field,
  Input,
  Modal,
  SegmentedControl,
  Select,
  Textarea,
} from '@/components/ui'
import { CURRENCIES } from '@/lib/constants'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { toMessage, toast } from '@/store/useToastStore'
import { useTransactionModal } from '@/store/useTransactionModal'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import type { TransactionType } from '@/types'
import { toDateKey } from '@/utils/dates'
import {
  MAX_NOTE_LENGTH,
  hasErrors,
  toTransactionPayload,
  validateTransaction,
  type FieldErrors,
  type TransactionFormValues,
} from '@/utils/validation'

function emptyValues(overrides: Partial<TransactionFormValues> = {}): TransactionFormValues {
  return {
    amount: '',
    type: 'expense',
    categoryId: '',
    date: toDateKey(new Date()),
    note: '',
    ...overrides,
  }
}

/**
 * Add/edit dialog. Validation runs on submit, then live per-field once a field
 * has been touched — errors that appear while typing the first character are
 * the fastest way to make a form feel hostile.
 */
export function TransactionForm() {
  const { open, editing, defaults, close } = useTransactionModal()
  const categories = useCategoriesStore((state) => state.items)
  const add = useTransactionsStore((state) => state.add)
  const edit = useTransactionsStore((state) => state.edit)
  const allowFutureDates = useSettingsStore((state) => state.allowFutureDates)
  const currency = useSettingsStore((state) => state.currency)

  const [values, setValues] = useState<TransactionFormValues>(emptyValues())
  const [errors, setErrors] = useState<FieldErrors<TransactionFormValues>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)

  const symbol = CURRENCIES.find((entry) => entry.code === currency)?.symbol ?? currency

  const availableCategories = useMemo(
    () => categories.filter((category) => category.kind === values.type || category.kind === 'both'),
    [categories, values.type],
  )

  // Re-seed the form whenever the dialog opens on a different subject. This is
  // React's "adjust state during render" pattern: cheaper than an effect,
  // because the stale values never reach the DOM.
  const instance = open ? (editing?.id ?? 'new') : 'closed'
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
        : emptyValues(defaults ?? {}),
    )
  }

  const setField = <K extends keyof TransactionFormValues>(
    key: K,
    value: TransactionFormValues[K],
  ) => {
    const next = { ...values, [key]: value }
    setValues(next)
    if (touched[key]) {
      setErrors(validateTransaction(next, { allowFutureDates }))
    }
  }

  /** Switching type can strand a category that does not apply to it. */
  const setType = (type: TransactionType) => {
    const stillValid = categories.some(
      (entry) =>
        entry.id === values.categoryId && (entry.kind === type || entry.kind === 'both'),
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
      description={
        editing ? 'Update the details and save your changes.' : 'Record money in or out.'
      }
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="transaction-form"
            loading={submitting}
          >
            {editing ? 'Save changes' : 'Add transaction'}
          </Button>
        </>
      }
    >
      <form id="transaction-form" onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <SegmentedControl<TransactionType>
          label="Transaction type"
          value={values.type}
          onChange={setType}
          options={[
            { value: 'expense', label: 'Expense', icon: <ArrowUpRight className="size-3.5" /> },
            { value: 'income', label: 'Income', icon: <ArrowDownLeft className="size-3.5" /> },
          ]}
        />

        <Field label="Amount" error={errors.amount} required>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              leading={<span className="text-[13px] font-medium">{symbol}</span>}
              value={values.amount}
              onChange={(event) => setField('amount', event.target.value)}
              onBlur={() => blur('amount')}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              data-autofocus
            />
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" error={errors.categoryId} required>
            {({ id, describedBy, invalid }) => (
              <Select
                id={id}
                name="categoryId"
                value={values.categoryId}
                onChange={(event) => setField('categoryId', event.target.value)}
                onBlur={() => blur('categoryId')}
                aria-describedby={describedBy}
                aria-invalid={invalid}
              >
                <option value="">Select a category…</option>
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
            hint={allowFutureDates ? 'Planning mode: future dates allowed.' : undefined}
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                name="date"
                type="date"
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
          hint={`${values.note.length}/${MAX_NOTE_LENGTH} characters`}
        >
          {({ id, describedBy, invalid }) => (
            <Textarea
              id={id}
              name="note"
              rows={2}
              placeholder="What was this for?"
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
