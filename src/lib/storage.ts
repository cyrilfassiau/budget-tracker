const memoryFallback = new Map<string, string>()

function getBackingStore(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  try {
    const probe = '__budget_tracker_probe__'
    window.localStorage.setItem(probe, probe)
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    return {
      getItem: (key) => memoryFallback.get(key) ?? null,
      setItem: (key, value) => void memoryFallback.set(key, value),
      removeItem: (key) => void memoryFallback.delete(key),
    }
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = getBackingStore().getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn(`[storage] could not read "${key}"`, error)
    return fallback
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    getBackingStore().setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`[storage] could not write "${key}"`, error)
    throw new Error('Storage is full — could not save your changes.')
  }
}

export function removeKey(key: string): void {
  getBackingStore().removeItem(key)
}
