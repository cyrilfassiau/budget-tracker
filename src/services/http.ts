import { STORAGE_KEYS } from '@/lib/constants'
import { readJSON } from '@/lib/storage'
import type { Settings } from '@/types'

import { DEFAULT_SETTINGS } from '@/lib/seed'

/**
 * Stand-in for network latency.
 *
 * Every service call awaits this, which means loading skeletons and pending
 * states are exercised in development instead of only appearing on a slow
 * connection in production. When a real backend arrives, this helper is
 * deleted and the `await` stays put.
 */
export function delay(ms?: number): Promise<void> {
  const configured =
    ms ?? readJSON<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS).latencyMs
  if (configured <= 0) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, configured))
}

/** Error shape the stores translate into toasts. */
export class ServiceError extends Error {
  constructor(
    message: string,
    readonly code: 'not_found' | 'conflict' | 'validation' | 'storage' = 'validation',
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

/** Defensive copy so callers can never mutate what is "in the database". */
export function clone<T>(value: T): T {
  return structuredClone(value)
}
