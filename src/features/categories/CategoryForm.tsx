import { Check } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button, Field, Input, Modal, TypePicker } from '@/components/ui'
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
  /** `null` opens the dialog in create mode. */
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

  // Seed the fields when the dialog opens on a different category, adjusting
  // state during render rather than in an effect.
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

  const PreviewIcon = getCategoryIcon(values.icon)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? 'Edit category' : 'New category'}
      description="The colour marks this category in the index."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="category-form" loading={submitting}>
            {category ? 'Save changes' : 'Create category'}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center border border-rule-strong transition-colors"
            style={{ backgroundColor: values.color, color: '#fff' }}
          >
            {/* oxlint-disable-next-line react/static-components */}
            <PreviewIcon className="size-4" strokeWidth={2} />
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
            <TypePicker<CategoryKind>
              label="Category applies to"
              value={values.kind}
              onChange={(kind) => setValues({ ...values, kind })}
              options={[
                { value: 'expense', label: 'Out' },
                { value: 'income', label: 'In' },
                { value: 'transfer', label: 'Transfer' },
                { value: 'both', label: 'Any' },
              ]}
            />
          )}
        </Field>

        <fieldset>
          <legend className="col-head mb-1.5 text-ink-2">Colour</legend>
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
                  'flex size-7 items-center justify-center border transition-colors',
                  values.color === color ? 'border-ink' : 'border-rule',
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
            <p role="alert" className="mt-1.5 text-[11px] font-semibold text-red">
              {errors.color}
            </p>
          ) : null}
        </fieldset>

        <fieldset>
          <legend className="col-head mb-1.5 text-ink-2">Icon</legend>
          <div
            role="radiogroup"
            aria-label="Category icon"
            className="grid max-h-36 grid-cols-8 gap-1 overflow-y-auto border border-rule p-1.5"
          >
            {ICON_KEYS.map((key) => {
              const Icon = getCategoryIcon(key)
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
                    'flex aspect-square items-center justify-center transition-colors',
                    selected ? 'bg-ink text-sheet' : 'text-ink-3 hover:bg-sheet-alt hover:text-ink',
                  )}
                >
                  {/* oxlint-disable-next-line react/static-components */}
                  <Icon className="size-4" />
                </button>
              )
            })}
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}
