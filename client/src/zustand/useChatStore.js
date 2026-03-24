import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export const useChatStore = create(
  devtools(
    persist(
      set => ({
        selectedConversation: null,
        tempConversation: null,
        typingUsers: {},

        unseenCount: {},

        setSelectedConversation: c => set({ selectedConversation: c }),
        setTempConversation: (c) => set({ tempConversation: c }),
        setTyping: (conversationId, userId, isTyping) => set(state => ({
          typingUsers: {
            ...state.typingUsers,
            [conversationId]: {
              ...(state.typingUsers[conversationId] || {}),
              [userId]: isTyping
            }
          }
        })),

        incrementUnseen: (conversationId) => set((state) => ({
          unseenCounts: {
            ...state.unseenCounts,
            [conversationId]: (state.unseenCounts[conversationId] || 0) + 1
          }
        })),

        resetUnseen: (conversationId) => set((state) => ({
          unseenCounts: { ...state.unseenCounts, [conversationId]: 0 }
        }))
      }),
      {
        name: 'chat-storage',
        partialize: (state) => ({
          // Chỉ lưu lại những cái đã có ID, không lưu chat tạm (isNew: true)
          selectedConversation: state.selectedConversation?._id ? state.selectedConversation : null
        })
      }
    )
  )
)

