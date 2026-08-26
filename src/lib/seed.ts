import { addMonths, format, startOfMonth } from 'date-fns'

import type { Budget, Category, Settings, Transaction } from '@/types'

import { DATE_FORMAT, MONTH_FORMAT, UNCATEGORIZED_ID } from './constants'
import { createId } from './id'

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  currency: 'EUR',
  locale: 'en-GB',
  allowFutureDates: false,
  latencyMs: 320,
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-salary', name: 'Salary', color: '#10b981', icon: 'banknote', kind: 'income', order: 0, isSystem: true },
  { id: 'cat-freelance', name: 'Freelance', color: '#14b8a6', icon: 'laptop', kind: 'income', order: 1 },
  { id: 'cat-groceries', name: 'Groceries', color: '#f97316', icon: 'cart', kind: 'expense', order: 2, isSystem: true },
  { id: 'cat-rent', name: 'Rent', color: '#6366f1', icon: 'home', kind: 'expense', order: 3, isSystem: true },
  { id: 'cat-transport', name: 'Transport', color: '#3b82f6', icon: 'bus', kind: 'expense', order: 4, isSystem: true },
  { id: 'cat-dining', name: 'Dining out', color: '#e11d48', icon: 'utensils', kind: 'expense', order: 5 },
  { id: 'cat-utilities', name: 'Utilities', color: '#f59e0b', icon: 'zap', kind: 'expense', order: 6 },
  { id: 'cat-health', name: 'Health', color: '#ec4899', icon: 'heart', kind: 'expense', order: 7 },
  { id: 'cat-leisure', name: 'Leisure', color: '#8b5cf6', icon: 'clapperboard', kind: 'expense', order: 8 },
  { id: 'cat-savings', name: 'Savings', color: '#0f766e', icon: 'piggyBank', kind: 'expense', order: 9 },
  {
    id: UNCATEGORIZED_ID,
    name: 'Uncategorized',
    color: '#64748b',
    icon: 'circle',
    kind: 'both',
    order: 99,
    isSystem: true,
  },
]

/** Deterministic PRNG so the demo dataset looks the same on every fresh load. */
function makeRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

interface SeedRecipe {
  categoryId: string
  type: 'income' | 'expense'
  notes: string[]
  /** Number of transactions to create per month. */
  perMonth: number
  min: number
  max: number
}

const RECIPES: SeedRecipe[] = [
  { categoryId: 'cat-salary', type: 'income', notes: ['Monthly salary'], perMonth: 1, min: 3100, max: 3250 },
  { categoryId: 'cat-freelance', type: 'income', notes: ['Landing page build', 'Design system audit', 'Consulting day'], perMonth: 1, min: 350, max: 1200 },
  { categoryId: 'cat-rent', type: 'expense', notes: ['Apartment rent'], perMonth: 1, min: 1150, max: 1150 },
  { categoryId: 'cat-groceries', type: 'expense', notes: ['Weekly shop', 'Market run', 'Corner store', 'Bulk order'], perMonth: 4, min: 38, max: 115 },
  { categoryId: 'cat-transport', type: 'expense', notes: ['Metro pass', 'Train ticket', 'Fuel', 'Taxi ride'], perMonth: 2, min: 12, max: 96 },
  { categoryId: 'cat-dining', type: 'expense', notes: ['Dinner with friends', 'Lunch out', 'Coffee & pastry', 'Takeaway'], perMonth: 3, min: 9, max: 78 },
  { categoryId: 'cat-utilities', type: 'expense', notes: ['Electricity', 'Internet', 'Mobile plan'], perMonth: 2, min: 22, max: 95 },
  { categoryId: 'cat-health', type: 'expense', notes: ['Pharmacy', 'Dentist', 'Gym membership'], perMonth: 1, min: 18, max: 140 },
  { categoryId: 'cat-leisure', type: 'expense', notes: ['Cinema', 'Concert ticket', 'Streaming', 'Bookshop'], perMonth: 2, min: 11, max: 85 },
  { categoryId: 'cat-savings', type: 'expense', notes: ['Transfer to savings'], perMonth: 1, min: 200, max: 400 },
]

/**
 * Six months of plausible history — a portfolio demo with empty charts sells
 * nothing, and this also exercises the month picker on first load.
 */
export function buildSeedTransactions(today = new Date()): Transaction[] {
  const random = makeRandom(20240517)
  const transactions: Transaction[] = []

  for (let offset = 5; offset >= 0; offset -= 1) {
    const monthStart = startOfMonth(addMonths(today, -offset))
    const isCurrentMonth = offset === 0
    const lastDay = isCurrentMonth ? today.getDate() : 28

    for (const recipe of RECIPES) {
      for (let i = 0; i < recipe.perMonth; i += 1) {
        const day = Math.max(1, Math.min(lastDay, Math.round(random() * (lastDay - 1)) + 1))
        if (isCurrentMonth && random() < 0.25) continue

        const date = new Date(monthStart)
        date.setDate(day)

        const amount = Math.round((recipe.min + random() * (recipe.max - recipe.min)) * 100) / 100
        const note = recipe.notes[Math.floor(random() * recipe.notes.length)] ?? ''
        const createdAt = new Date(date).toISOString()

        transactions.push({
          id: createId('txn'),
          amount,
          type: recipe.type,
          categoryId: recipe.categoryId,
          date: format(date, DATE_FORMAT),
          note,
          createdAt,
          updatedAt: createdAt,
        })
      }
    }
  }

  return transactions
}

export function buildSeedBudgets(today = new Date()): Budget[] {
  const limits: Record<string, number> = {
    'cat-groceries': 350,
    'cat-rent': 1200,
    'cat-transport': 140,
    'cat-dining': 160,
    'cat-utilities': 150,
    'cat-leisure': 120,
  }

  return Array.from({ length: 6 }).flatMap((_, index) => {
    const month = format(addMonths(today, -index), MONTH_FORMAT)
    return Object.entries(limits).map(([categoryId, limit]) => ({
      id: createId('bdg'),
      categoryId,
      month,
      limit,
    }))
  })
}
