/**
 * The only module in the app that touches `localStorage`.
 *
 * Everything above it (services → stores → components) goes through the async
 * service API, so replacing this file with `fetch` calls is a contained change.
 */

const memoryFallback = new Map<string, string>()

/** Safari private mode and SSR both make `localStorage` unavailable. */
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
    // Quota exceeded is the realistic failure here; surface it to the caller
    // so the service can turn it into a user-visible error.
    console.error(`[storage] could not write "${key}"`, error)
    throw new Error('Storage is full — could not save your changes.')
  }
}

export function removeKey(key: string): void {
  getBackingStore().removeItem(key)
}
