export function createId(prefix = 'id'): string {
  const cryptoRef = globalThis.crypto
  if (cryptoRef && 'randomUUID' in cryptoRef) {
    return `${prefix}-${cryptoRef.randomUUID()}`
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
