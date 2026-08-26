import { describe, expect, it } from 'vitest'

import {
  toTransactionPayload,
  validateBudgetLimit,
  validateCategory,
  validateTransaction,
  type TransactionFormValues,
} from './validation'

const valid: TransactionFormValues = {
  amount: '25.50',
  type: 'expense',
  categoryId: 'cat-groceries',
  date: '2026-03-10',
  note: 'Weekly shop',
}

const options = { allowFutureDates: false }

describe('validateTransaction', () => {
  it('accepts a well-formed transaction', () => {
    expect(validateTransaction(valid, options)).toEqual({})
  })

  it('rejects a missing amount', () => {
    expect(validateTransaction({ ...valid, amount: '' }, options).amount).toBeDefined()
  })

  it('rejects zero and negative amounts', () => {
    expect(validateTransaction({ ...valid, amount: '0' }, options).amount).toMatch(/greater than zero/)
    expect(validateTransaction({ ...valid, amount: '-5' }, options).amount).toMatch(/greater than zero/)
  })

  it('rejects text in the amount field', () => {
    expect(validateTransaction({ ...valid, amount: 'abc' }, options).amount).toBeDefined()
  })

  it('requires a category', () => {
    expect(validateTransaction({ ...valid, categoryId: '' }, options).categoryId).toBeDefined()
  })

  it('rejects future dates by default', () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    const values = { ...valid, date: future.toISOString().slice(0, 10) }
    expect(validateTransaction(values, options).date).toBeDefined()
  })

  it('allows future dates in planning mode', () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    const values = { ...valid, date: future.toISOString().slice(0, 10) }
    expect(validateTransaction(values, { allowFutureDates: true }).date).toBeUndefined()
  })

  it("accepts today's date", () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(validateTransaction({ ...valid, date: today }, options).date).toBeUndefined()
  })

  it('rejects an over-long note', () => {
    expect(validateTransaction({ ...valid, note: 'x'.repeat(200) }, options).note).toBeDefined()
  })
})

describe('toTransactionPayload', () => {
  it('parses the amount and trims the note', () => {
    expect(toTransactionPayload({ ...valid, amount: '1 234,56', note: '  Rent  ' })).toEqual({
      amount: 1234.56,
      type: 'expense',
      categoryId: 'cat-groceries',
      date: '2026-03-10',
      note: 'Rent',
    })
  })
})

describe('validateCategory', () => {
  const category = { name: 'Coffee', color: '#f97316', icon: 'coffee', kind: 'expense' as const }

  it('accepts a valid category', () => {
    expect(validateCategory(category, [])).toEqual({})
  })

  it('requires a name', () => {
    expect(validateCategory({ ...category, name: '  ' }, []).name).toBeDefined()
  })

  it('rejects a duplicate name regardless of case', () => {
    expect(validateCategory(category, ['coffee']).name).toMatch(/already exists/)
  })

  it('rejects a malformed colour', () => {
    expect(validateCategory({ ...category, color: 'orange' }, []).color).toBeDefined()
  })
})

describe('validateBudgetLimit', () => {
  it('accepts a positive limit', () => {
    expect(validateBudgetLimit('250')).toBeUndefined()
  })

  it('rejects empty, zero and non-numeric limits', () => {
    expect(validateBudgetLimit('')).toBeDefined()
    expect(validateBudgetLimit('0')).toBeDefined()
    expect(validateBudgetLimit('lots')).toBeDefined()
  })
})
