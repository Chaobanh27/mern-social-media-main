import { useEffect } from 'react'
import { useThemeStore } from '~/zustand/useThemeStore'

const ThemeApplier = () => {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      root.classList.remove('light', 'dark')

      if (theme === 'dark' || (theme === 'system' && mediaQuery.matches)) {
        root.classList.add('dark')
      } else {
        root.classList.add('light')
      }
    }

    applyTheme()

    mediaQuery.addEventListener('change', applyTheme)
    return () => mediaQuery.removeEventListener('change', applyTheme)
  }, [theme])

  return null
}

export default ThemeApplier
