import { useState } from 'react'

import { Button, Field, Input, Modal, Select } from '@/components/ui'
import { CURRENCIES } from '@/lib/constants'
import { useBudgetsStore } from '@/store/useBudgetsStore'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { toMessage, toast } from '@/store/useToastStore'
import { formatMonthLabel } from '@/utils/dates'
import { parseAmount } from '@/utils/money'
import { validateBudgetLimit } from '@/utils/validation'

interface BudgetFormProps {
  open: boolean
  month: string

  categoryId: string | null
  currentLimit: number | null
  onClose: () => void
}

export function BudgetForm({
  open,
  month,
  categoryId,
  currentLimit,
  onClose,
}: BudgetFormProps) {
  const categories = useCategoriesStore((state) => state.items)
  const budgets = useBudgetsStore((state) => state.items)
  const setLimit = useBudgetsStore((state) => state.setLimit)
  const currency = useSettingsStore((state) => state.currency)

  const [selectedCategory, setSelectedCategory] = useState('')
  const [limit, setLimitValue] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)

  const symbol = CURRENCIES.find((entry) => entry.code === currency)?.symbol ?? currency
  const isEditing = categoryId !== null && currentLimit !== null

  const budgetedIds = new Set(
    budgets.filter((budget) => budget.month === month).map((budget) => budget.categoryId),
  )
  const options = categories.filter(
    (category) =>
      category.kind !== 'income' &&
      (category.id === categoryId || !budgetedIds.has(category.id)),
  )

  const instance = open ? (categoryId ?? 'new') : 'closed'
  const [renderedInstance, setRenderedInstance] = useState(instance)

  if (instance !== renderedInstance) {
    setRenderedInstance(instance)
    setError(undefined)
    setSelectedCategory(categoryId ?? options[0]?.id ?? '')
    setLimitValue(currentLimit !== null ? String(currentLimit) : '')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const limitError = validateBudgetLimit(limit)
    setError(limitError)
    if (limitError || !selectedCategory) {
      if (!selectedCategory) setError('Pick a category.')
      return
    }

    setSubmitting(true)
    try {
      await setLimit({
        categoryId: selectedCategory,
        month,
        limit: parseAmount(limit) ?? 0,
      })
      toast.success(isEditing ? 'Budget updated' : 'Budget set')
      onClose()
    } catch (caught) {
      toast.error(toMessage(caught, 'Could not save the budget.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit budget' : 'New budget'}
      description={`For ${formatMonthLabel(month)}`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="budget-form" loading={submitting}>
            {isEditing ? 'Save' : 'Set'}
          </Button>
        </>
      }
    >
      <form id="budget-form" onSubmit={handleSubmit} className="flex flex-col gap-4 pb-2" noValidate>
        <Field label="Category" required>
          {({ id }) => (
            <Select
              id={id}
              value={selectedCategory}
              disabled={isEditing}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              {options.length === 0 ? <option value="">Every category already has a limit</option> : null}
              {options.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field
          label="Monthly limit"
          error={error}
          required
          hint="Progress is measured against how much of the month has passed."
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              leading={<span className="text-[18px] font-extrabold">{symbol}</span>}
              value={limit}
              onChange={(event) => setLimitValue(event.target.value)}
              onBlur={() => setError(validateBudgetLimit(limit))}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              data-autofocus
            />
          )}
        </Field>
      </form>
    </Modal>
  )
}
