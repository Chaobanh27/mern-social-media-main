import { create } from 'zustand'
import { io } from 'socket.io-client'
import { API_ROOT } from '~/utils/constants'

// Biến ngoài Không nằm trong store, không gây re-render
let socketInstance = null

export const useSocketStore = create((set, get) => ({
  onlineUsers: [],

  connectSocket: async (userId, token) => {
    // Nếu đã có kết nối, không tạo mới
    if (socketInstance) return

    socketInstance = io(API_ROOT, {
      auth: { token, userId },
      transports: ['websocket']
    })

    // Lắng nghe sự kiện
    socketInstance.on('getOnlineUsers', users => {
      set({ onlineUsers: users })
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id)
    })

    socketInstance.on('disconnect', reason => {
      console.log('Socket disconnected:', reason)
    })

    socketInstance.on('connect_error', error => {
      console.error('Socket connection error:', error.message)
    })

    // Có thể thêm các event khác ở đây
  },

  disconnectSocket: () => {
    if (socketInstance) {
      socketInstance.disconnect()
      socketInstance = null // Reset biến global
      set({ onlineUsers: [] })
    }
  },

  manageSocket: async (userId, token) => {
    // Nếu có userId mới và đã có socket cũ
    if (userId && socketInstance) {
    // Kiểm tra xem ID có khớp không, nếu khác thì ngắt cũ để tạo mới cho user mới
      if (socketInstance.auth?.query?.userId !== userId) {
        get().disconnectSocket()
      }
    }
    // Thiết lập kết nối mới nếu có đủ thông tin và chưa có socketInstance
    if (userId && token && !socketInstance) {
      await get().connectSocket(userId, token)
    } else {
      get().disconnectSocket()
    }
  },

  // Getter để truy cập socket từ bên ngoài mà không cần qua State
  // Nên sử dụng useMemo ở component để chỉ lấy socket một lần duy nhất khi component mount
  getSocket: () => socketInstance
}))