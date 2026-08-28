import { STORAGE_KEYS } from '@/lib/constants'
import { readJSON } from '@/lib/storage'
import type { Settings } from '@/types'

import { DEFAULT_SETTINGS } from '@/lib/seed'

export function delay(ms?: number): Promise<void> {
  const configured =
    ms ?? readJSON<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS).latencyMs
  if (configured <= 0) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, configured))
}

export type ServiceErrorCode = 'not_found' | 'conflict' | 'validation' | 'storage'

export class ServiceError extends Error {
  code: ServiceErrorCode

  constructor(message: string, code: ServiceErrorCode = 'validation') {
    super(message)
    this.name = 'ServiceError'
    this.code = code
  }
}

export function clone<T>(value: T): T {
  return structuredClone(value)
}
