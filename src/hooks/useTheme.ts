import { useEffect } from 'react'

import { useUIStore } from '@/store/useUIStore'

const DARK_QUERY = '(prefers-color-scheme: dark)'

export function useTheme(): void {
  const theme = useUIStore((state) => state.theme)

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)

    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', isDark)
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', isDark ? '#0a0e15' : '#f4f5f7')
    }

    apply()
    if (theme !== 'system') return
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])
}
