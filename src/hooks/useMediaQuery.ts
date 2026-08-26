import { useCallback, useSyncExternalStore } from 'react'

/**
 * Subscribes to a media query through React's external-store API, which keeps
 * the value correct on first render and avoids a setState-in-effect round trip.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
