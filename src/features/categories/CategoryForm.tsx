import { Check } from 'lucide-react'
import { createElement, useMemo, useState } from 'react'

import { Button, Field, Input, Modal, SegmentedPill } from '@/components/ui'
import { CATEGORY_COLORS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { ICON_KEYS, getCategoryIcon } from '@/lib/icons'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { toMessage, toast } from '@/store/useToastStore'
import type { Category, CategoryKind } from '@/types'
import {
  hasErrors,
  validateCategory,
  type CategoryFormValues,
  type FieldErrors,
} from '@/utils/validation'

interface CategoryFormProps {
  open: boolean

  category: Category | null
  onClose: () => void
}

const DEFAULTS: CategoryFormValues = {
  name: '',
  color: CATEGORY_COLORS[4],
  icon: 'circle',
  kind: 'expense',
}

export function CategoryForm({ open, category, onClose }: CategoryFormProps) {
  const categories = useCategoriesStore((state) => state.items)
  const add = useCategoriesStore((state) => state.add)
  const edit = useCategoriesStore((state) => state.edit)

  const [values, setValues] = useState<CategoryFormValues>(DEFAULTS)
  const [errors, setErrors] = useState<FieldErrors<CategoryFormValues>>({})
  const [submitting, setSubmitting] = useState(false)

  const takenNames = useMemo(
    () =>
      categories
        .filter((entry) => entry.id !== category?.id)
        .map((entry) => entry.name),
    [categories, category],
  )

  const instance = open ? (category?.id ?? 'new') : 'closed'
  const [renderedInstance, setRenderedInstance] = useState(instance)

  if (instance !== renderedInstance) {
    setRenderedInstance(instance)
    setErrors({})
    setValues(
      category
        ? { name: category.name, color: category.color, icon: category.icon, kind: category.kind }
        : DEFAULTS,
    )
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors = validateCategory(values, takenNames)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    setSubmitting(true)
    try {
      if (category) {
        await edit(category.id, values)
        toast.success(`"${values.name}" updated`)
      } else {
        await add(values)
        toast.success(`"${values.name}" created`)
      }
      onClose()
    } catch (error) {
      toast.error(toMessage(error, 'Could not save the category.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? 'Edit category' : 'New category'}
      description="The colour and icon identify it everywhere in the app."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="category-form" loading={submitting}>
            {category ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="flex flex-col gap-4 pb-2" noValidate>
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-full text-white transition-colors"
            style={{ backgroundColor: values.color }}
          >
            {createElement(getCategoryIcon(values.icon), {
              className: 'size-5',
              strokeWidth: 2.25,
            })}
          </span>
          <Field label="Name" error={errors.name} required className="flex-1">
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                value={values.name}
                maxLength={32}
                placeholder="e.g. Coffee"
                onChange={(event) => setValues({ ...values, name: event.target.value })}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                data-autofocus
              />
            )}
          </Field>
        </div>
        <Field label="Used for">
          {() => (
            <SegmentedPill<CategoryKind>
              label="Category applies to"
              value={values.kind}
              onChange={(kind) => setValues({ ...values, kind })}
              options={[
                { value: 'expense', label: 'Out' },
                { value: 'income', label: 'In' },
                { value: 'transfer', label: 'Moved' },
                { value: 'both', label: 'Any' },
              ]}
              className="w-full"
            />
          )}
        </Field>
        <fieldset>
          <legend className="mb-2 text-[13px] font-bold text-fg-muted">Colour</legend>
          <div role="radiogroup" aria-label="Category colour" className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                role="radio"
                aria-checked={values.color === color}
                aria-label={`Colour ${color}`}
                onClick={() => setValues({ ...values, color })}
                className={cn(
                  'flex size-8 items-center justify-center rounded-full transition-transform',
                  'hover:scale-110',
                  values.color === color && 'ring-2 ring-fg ring-offset-2 ring-offset-[var(--raised)]',
                )}
                style={{ backgroundColor: color }}
              >
                {values.color === color ? (
                  <Check className="size-4 text-white" strokeWidth={3} />
                ) : null}
              </button>
            ))}
          </div>
          {errors.color ? (
            <p role="alert" className="mt-1.5 text-[12px] font-semibold text-negative">
              {errors.color}
            </p>
          ) : null}
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-[13px] font-bold text-fg-muted">Icon</legend>
          <div
            role="radiogroup"
            aria-label="Category icon"
            className="grid max-h-40 grid-cols-7 gap-1.5 overflow-y-auto rounded-[16px] bg-surface p-2"
          >
            {ICON_KEYS.map((key) => {
              const selected = values.icon === key
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={key}
                  onClick={() => setValues({ ...values, icon: key })}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-full transition-colors',
                    selected ? 'bg-fg text-bg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
                  )}
                >
                  {createElement(getCategoryIcon(key), { className: 'size-[18px]' })}
                </button>
              )
            })}
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}
