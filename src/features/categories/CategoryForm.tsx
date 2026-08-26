import { Check } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button, Field, Input, Modal, SegmentedControl } from '@/components/ui'
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

  useEffect(() => {
    if (!open) return
    setErrors({})
    setValues(
      category
        ? { name: category.name, color: category.color, icon: category.icon, kind: category.kind }
        : DEFAULTS,
    )
  }, [open, category])

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
      description="Colour and icon are used across charts and lists."
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
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl transition-colors"
            style={{
              backgroundColor: `color-mix(in srgb, ${values.color} 16%, transparent)`,
              color: values.color,
            }}
          >
            <PreviewIcon className="size-5" strokeWidth={2.2} />
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
            <SegmentedControl<CategoryKind>
              label="Category applies to"
              size="sm"
              value={values.kind}
              onChange={(kind) => setValues({ ...values, kind })}
              options={[
                { value: 'expense', label: 'Expenses' },
                { value: 'income', label: 'Income' },
                { value: 'both', label: 'Both' },
              ]}
            />
          )}
        </Field>

        <fieldset>
          <legend className="mb-2 text-[13px] font-medium text-fg">Colour</legend>
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
                  'flex size-8 items-center justify-center rounded-xl transition-transform',
                  'hover:scale-110',
                  values.color === color && 'ring-2 ring-offset-2 ring-offset-[var(--card)]',
                )}
                style={{
                  backgroundColor: color,
                  ...(values.color === color ? { '--tw-ring-color': color } as React.CSSProperties : {}),
                }}
              >
                {values.color === color ? (
                  <Check className="size-4 text-white" strokeWidth={3} />
                ) : null}
              </button>
            ))}
          </div>
          {errors.color ? (
            <p role="alert" className="mt-1.5 text-xs font-medium text-expense">
              {errors.color}
            </p>
          ) : null}
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-[13px] font-medium text-fg">Icon</legend>
          <div
            role="radiogroup"
            aria-label="Category icon"
            className="grid max-h-40 grid-cols-8 gap-1.5 overflow-y-auto rounded-xl border border-border-base p-2"
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
                    'flex aspect-square items-center justify-center rounded-lg transition-colors',
                    selected
                      ? 'bg-accent-soft text-accent'
                      : 'text-fg-subtle hover:bg-card-muted hover:text-fg',
                  )}
                >
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
