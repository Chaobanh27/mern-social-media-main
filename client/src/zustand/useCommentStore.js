import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const useCommentStore = create(devtools(
  set => ({
    activeInput: { commentId: null, type: null },

    setActiveInput: (id, type) => set({ activeInput: { commentId: id, type: type } }),

    resetInput: () => set({ activeInput: { commentId: null, type: null } })
  }),
  {
    name: 'comment-storage'
  }
))