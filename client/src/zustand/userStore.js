import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'

export const userStore = create(
  devtools(
    persist(
      (set) => ({
        user: null,
        setUser: (user) => set({ user }),
        clearUser: () => set({ user: null })
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({
          user: state.user
        })
      }
    ),
    {
      name: 'user store'
    }
  )

)

