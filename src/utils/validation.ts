import type { CategoryKind, NewTransaction, TransactionType } from '@/types'

import { isFutureDate, isValidDateString } from './dates'
import { parseAmount } from './money'

export interface TransactionFormValues {
  amount: string
  type: TransactionType
  categoryId: string
  date: string
  note: string
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>

export const MAX_AMOUNT = 1_000_000_000
export const MAX_NOTE_LENGTH = 140

/**
 * Validation lives outside the component so the same rules can be unit-tested
 * and reused by CSV import.
 */
export function validateTransaction(
  values: TransactionFormValues,
  options: { allowFutureDates: boolean },
): FieldErrors<TransactionFormValues> {
  const errors: FieldErrors<TransactionFormValues> = {}

  const amount = parseAmount(values.amount)
  if (values.amount.trim() === '') {
    errors.amount = 'Enter an amount.'
  } else if (amount === null) {
    errors.amount = 'That does not look like a number.'
  } else if (amount <= 0) {
    errors.amount = 'Amount must be greater than zero.'
  } else if (amount > MAX_AMOUNT) {
    errors.amount = 'That amount is unrealistically large.'
  }

  if (!values.categoryId) {
    errors.categoryId = 'Pick a category.'
  }

  if (!values.date) {
    errors.date = 'Pick a date.'
  } else if (!isValidDateString(values.date)) {
    errors.date = 'Use the format YYYY-MM-DD.'
  } else if (!options.allowFutureDates && isFutureDate(values.date)) {
    errors.date = 'Future dates are off — enable planning mode in Settings.'
  }

  if (values.note.length > MAX_NOTE_LENGTH) {
    errors.note = `Keep the note under ${MAX_NOTE_LENGTH} characters.`
  }

  return errors
}

export function hasErrors<T>(errors: FieldErrors<T>): boolean {
  return Object.values(errors).some(Boolean)
}

/** Turns validated form values into the payload the service expects. */
export function toTransactionPayload(values: TransactionFormValues): NewTransaction {
  return {
    amount: parseAmount(values.amount) ?? 0,
    type: values.type,
    categoryId: values.categoryId,
    date: values.date,
    note: values.note.trim(),
  }
}

export interface CategoryFormValues {
  name: string
  color: string
  icon: string
  kind: CategoryKind
}

export function validateCategory(
  values: CategoryFormValues,
  existingNames: string[],
): FieldErrors<CategoryFormValues> {
  const errors: FieldErrors<CategoryFormValues> = {}
  const name = values.name.trim()

  if (!name) {
    errors.name = 'Give the category a name.'
  } else if (name.length > 32) {
    errors.name = 'Keep the name under 32 characters.'
  } else if (existingNames.some((existing) => existing.toLowerCase() === name.toLowerCase())) {
    errors.name = 'A category with that name already exists.'
  }

  if (!/^#[0-9a-f]{6}$/i.test(values.color)) {
    errors.color = 'Pick a colour.'
  }

  return errors
}

export function validateBudgetLimit(input: string): string | undefined {
  const amount = parseAmount(input)
  if (input.trim() === '') return 'Enter a monthly limit.'
  if (amount === null) return 'That does not look like a number.'
  if (amount <= 0) return 'The limit must be greater than zero.'
  if (amount > MAX_AMOUNT) return 'That limit is unrealistically large.'
  return undefined
}
