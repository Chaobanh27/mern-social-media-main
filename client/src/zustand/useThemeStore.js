import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'

export const useThemeStore = create(
  devtools(
    persist(
      (set) => ({
        theme: 'system',
        setTheme: (theme) => set({ theme })
      }),
      {
        name: 'theme-storage'
      }
    ),
    {
      name: 'theme store'
    }
  )
)
