import { UNCATEGORIZED_ID } from '@/lib/constants'
import type { Category, NewTransaction, Transaction, TransactionType } from '@/types'

import { isValidDateString } from './dates'
import { parseAmount } from './money'

const HEADERS = ['date', 'type', 'category', 'amount', 'note'] as const

function escapeCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function toCSV(transactions: Transaction[], categories: Category[]): string {
  const nameById = new Map(categories.map((category) => [category.id, category.name]))
  const rows = transactions.map((transaction) =>
    [
      transaction.date,
      transaction.type,
      nameById.get(transaction.categoryId) ?? 'Uncategorized',
      transaction.amount.toFixed(2),
      transaction.note,
    ]
      .map((cell) => escapeCell(String(cell)))
      .join(','),
  )
  return [HEADERS.join(','), ...rows].join('\n')
}

export function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        cell += char
      }
      continue
    }

    if (char === '"') inQuotes = true
    else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell.replace(/\r$/, ''))
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  if (cell !== '' || row.length > 0) {
    row.push(cell.replace(/\r$/, ''))
    rows.push(row)
  }

  return rows.filter((entry) => entry.some((value) => value.trim() !== ''))
}

export interface ImportResult {
  transactions: NewTransaction[]
  errors: string[]
}

export function fromCSV(text: string, categories: Category[]): ImportResult {
  const rows = parseCSV(text)
  const errors: string[] = []
  const transactions: NewTransaction[] = []

  if (rows.length === 0) {
    return { transactions, errors: ['The file is empty.'] }
  }

  const header = rows[0]!.map((cell) => cell.trim().toLowerCase())
  const hasHeader = HEADERS.every((expected) => header.includes(expected))
  if (!hasHeader) {
    return {
      transactions,
      errors: [`Missing header row. Expected columns: ${HEADERS.join(', ')}.`],
    }
  }

  const index = Object.fromEntries(
    HEADERS.map((name) => [name, header.indexOf(name)]),
  ) as Record<(typeof HEADERS)[number], number>
  const categoryByName = new Map(
    categories.map((category) => [category.name.trim().toLowerCase(), category.id]),
  )

  rows.slice(1).forEach((row, offset) => {
    const line = offset + 2
    const date = (row[index.date] ?? '').trim()
    const rawType = (row[index.type] ?? '').trim().toLowerCase()
    const categoryName = (row[index.category] ?? '').trim()
    const amount = parseAmount(row[index.amount] ?? '')
    const note = (row[index.note] ?? '').trim()

    if (!isValidDateString(date)) {
      errors.push(`Line ${line}: "${date}" is not a valid YYYY-MM-DD date.`)
      return
    }
    if (rawType !== 'income' && rawType !== 'expense' && rawType !== 'transfer') {
      errors.push(`Line ${line}: type must be "income", "expense" or "transfer".`)
      return
    }
    if (amount === null || amount <= 0) {
      errors.push(`Line ${line}: amount must be a number greater than zero.`)
      return
    }

    transactions.push({
      date,
      type: rawType as TransactionType,
      categoryId: categoryByName.get(categoryName.toLowerCase()) ?? UNCATEGORIZED_ID,
      amount,
      note,
    })
  })

  return { transactions, errors }
}

export function downloadFile(filename: string, contents: string, mime = 'text/csv'): void {
  const blob = new Blob([contents], { type: `${mime};charset=utf-8;` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
