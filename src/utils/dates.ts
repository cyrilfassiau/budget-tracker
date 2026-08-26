import {
  addMonths,
  eachMonthOfInterval,
  endOfMonth,
  format,
  isValid,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns'

import { DATE_FORMAT, MONTH_FORMAT } from '@/lib/constants'

/** `yyyy-MM` key for the month a date belongs to. */
export function toMonthKey(date: Date | string): string {
  const value = typeof date === 'string' ? parseISO(date) : date
  return format(value, MONTH_FORMAT)
}

export function toDateKey(date: Date | string): string {
  const value = typeof date === 'string' ? parseISO(date) : date
  return format(value, DATE_FORMAT)
}

export function monthKeyToDate(month: string): Date {
  return parseISO(`${month}-01`)
}

export function formatMonthLabel(month: string, pattern = 'MMMM yyyy'): string {
  return format(monthKeyToDate(month), pattern)
}

export function formatDateLabel(date: string, pattern = 'd MMM yyyy'): string {
  const parsed = parseISO(date)
  return isValid(parsed) ? format(parsed, pattern) : date
}

export function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value))
}

/** True when the date falls after today (day-level comparison). */
export function isFutureDate(value: string, today = new Date()): boolean {
  if (!isValidDateString(value)) return false
  return parseISO(value).getTime() > endOfDay(today).getTime()
}

function endOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(23, 59, 59, 999)
  return copy
}

/** Inclusive `yyyy-MM` keys for the N months ending at `month`. */
export function lastNMonths(n: number, month: string): string[] {
  const end = monthKeyToDate(month)
  const start = subMonths(end, n - 1)
  return eachMonthOfInterval({ start, end }).map((date) => format(date, MONTH_FORMAT))
}

export function shiftMonth(month: string, delta: number): string {
  return format(addMonths(monthKeyToDate(month), delta), MONTH_FORMAT)
}

export function monthBounds(month: string): { from: string; to: string } {
  const date = monthKeyToDate(month)
  return {
    from: format(startOfMonth(date), DATE_FORMAT),
    to: format(endOfMonth(date), DATE_FORMAT),
  }
}

export function currentMonthKey(today = new Date()): string {
  return format(today, MONTH_FORMAT)
}

export function daysInMonth(month: string): number {
  return Number(monthBounds(month).to.slice(-2))
}

/**
 * How many days of `month` have actually happened. A finished month is all of
 * them; a month that has not started is none. This is the number the whole app
 * reads its "am I ahead or behind" judgement from.
 */
export function daysElapsed(month: string, today = new Date()): number {
  const current = currentMonthKey(today)
  if (month < current) return daysInMonth(month)
  if (month > current) return 0
  return today.getDate()
}

/** Days elapsed as a fraction of the month, 0-1. */
export function monthProgress(month: string, today = new Date()): number {
  const total = daysInMonth(month)
  return total === 0 ? 0 : daysElapsed(month, today) / total
}

export function isCurrentMonth(month: string, today = new Date()): boolean {
  return month === currentMonthKey(today)
}

/** True once every day of the month has passed. */
export function isMonthComplete(month: string, today = new Date()): boolean {
  return month < currentMonthKey(today)
}
