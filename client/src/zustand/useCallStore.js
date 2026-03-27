import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const useCallStore = create(
  devtools(
    set => ({
      callData: null,

      isIncoming: false,

      isCalling: false,

      setIncomingCall: data => set({ callData: data, isIncoming: true }),

      acceptCall: () => set({ isIncoming: false, isCalling: true }),

      rejectCall: () => set({ isComing: false, callData: null }),

      endCall: () => set({ isCalling: false, isIncoming: false, callData: null })
    }),
    {
      name: 'call-storage'
    }
  )

)