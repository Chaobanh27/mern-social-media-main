import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const useCallStore = create(
  devtools(
    set => ({
      callData: null,

      isIncoming: false,

      isCalling: false,

      remoteParticipants: [],
      activeGroupCalls: [], // Lưu danh sách roomName đang active
      isInCall: s => s.isCalling || s.isIncoming,
      setActiveCalls: (roomNames) => set({ activeGroupCalls: roomNames }),
      addGroupCall: (roomName) => set(s => ({
        activeGroupCalls: [...new Set([...s.activeGroupCalls, roomName])]
      })),
      removeGroupCall: (roomName) => set(s => ({
        activeGroupCalls: s.activeGroupCalls.filter(r => r !== roomName)
      })),
      setIncomingCall: data => set({ callData: data, isIncoming: true }),

      acceptCall: () => set({ isIncoming: false, isCalling: true }),

      addParticipant: (p) => set(s => {
        const exists = s.remoteParticipants.some(existing => (existing._id === p._id) || (existing.sid === p.sid))
        if (exists) return s
        return { remoteParticipants: [...s.remoteParticipants, p] }
      }),

      removeParticipant: (userId) => set(s => ({
        remoteParticipants: s.remoteParticipants.filter(p => p._id !== userId || p.userId !== userId)
      })),

      rejectCall: () => set({ isInComing: false, callData: null }),

      endCall: () => set({
        isCalling: false,
        isIncoming: false,
        callData: null,
        remoteParticipants: []
      })
    }),
    {
      name: 'call-storage'
    }
  )

)