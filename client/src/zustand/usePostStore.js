import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'

export const usePostStore = create(
  devtools(
    persist(
      (set) => ({
        postId: null,
        setPostId: (postId) => set({ postId })
      }),
      {
        name: 'post-storage'
      }
    ),
    {
      name: 'post store'
    }
  )

)
