import { describe, expect, it } from 'vitest'

import { UNCATEGORIZED_ID } from '@/lib/constants'
import { makeCategory, makeTransaction } from '@/test/factories'

import { fromCSV, parseCSV, toCSV } from './csv'

const categories = [
  makeCategory({ id: 'cat-groceries', name: 'Groceries' }),
  makeCategory({ id: 'cat-salary', name: 'Salary', kind: 'income' }),
]

describe('toCSV', () => {
  it('writes a header and one row per transaction', () => {
    const csv = toCSV([makeTransaction({ amount: 12.5, note: 'Bread' })], categories)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('date,type,category,amount,note')
    expect(lines[1]).toBe('2026-03-15,expense,Groceries,12.50,Bread')
  })

  it('quotes notes containing commas', () => {
    const csv = toCSV([makeTransaction({ note: 'Bread, milk' })], categories)
    expect(csv).toContain('"Bread, milk"')
  })
})

describe('parseCSV', () => {
  it('handles quoted cells with commas and escaped quotes', () => {
    expect(parseCSV('a,"b,c","say ""hi"""')).toEqual([['a', 'b,c', 'say "hi"']])
  })

  it('skips blank lines', () => {
    expect(parseCSV('a,b\n\nc,d')).toHaveLength(2)
  })
})

describe('fromCSV', () => {
  const header = 'date,type,category,amount,note'

  it('round-trips what toCSV produced', () => {
    const original = makeTransaction({ amount: 12.5, note: 'Bread' })
    const { transactions, errors } = fromCSV(toCSV([original], categories), categories)
    expect(errors).toEqual([])
    expect(transactions[0]).toEqual({
      date: '2026-03-15',
      type: 'expense',
      categoryId: 'cat-groceries',
      amount: 12.5,
      note: 'Bread',
    })
  })

  it('maps unknown category names to Uncategorized', () => {
    const { transactions } = fromCSV(`${header}\n2026-03-01,expense,Nonsense,10,x`, categories)
    expect(transactions[0]?.categoryId).toBe(UNCATEGORIZED_ID)
  })

  it('reports the missing header instead of guessing', () => {
    const { transactions, errors } = fromCSV('nope\n1,2', categories)
    expect(transactions).toHaveLength(0)
    expect(errors[0]).toMatch(/header/i)
  })

  it('skips bad rows and keeps the good ones', () => {
    const csv = [
      header,
      '2026-03-01,expense,Groceries,10,ok',
      'not-a-date,expense,Groceries,10,bad date',
      '2026-03-02,transfer,Groceries,10,bad type',
      '2026-03-03,expense,Groceries,0,bad amount',
    ].join('\n')

    const { transactions, errors } = fromCSV(csv, categories)
    expect(transactions).toHaveLength(1)
    expect(errors).toHaveLength(3)
    expect(errors[0]).toContain('Line 3')
  })

  it('reports an empty file', () => {
    expect(fromCSV('', categories).errors[0]).toMatch(/empty/i)
  })
})
