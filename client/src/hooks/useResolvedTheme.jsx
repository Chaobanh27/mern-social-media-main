import { dark } from '@clerk/themes'
import { useEffect, useState } from 'react'
import { themeStore } from '~/zustand/themeStore'

export function useResolvedTheme() {
  const currentTheme = themeStore((s) => s.theme)

  const [systemTheme, setSystemTheme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? dark
      : ''
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const handler = () => {
      setSystemTheme(
        media.matches ? dark : ''
      )
    }

    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  const resolvedTheme = currentTheme === 'system' ? systemTheme : currentTheme

  return resolvedTheme
}
