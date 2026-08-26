import type { Settings } from '@/types'

import { db } from './db'
import { clone, delay } from './http'

export async function get(): Promise<Settings> {
  await delay(0)
  return clone(db.settings.read())
}

export async function update(patch: Partial<Settings>): Promise<Settings> {
  await delay(0)
  const next = { ...db.settings.read(), ...patch }
  db.settings.write(next)
  return clone(next)
}
