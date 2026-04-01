import { create } from 'zustand'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { devtools } from 'zustand/middleware'

// Biến ngoài Không nằm trong store, không gây re-render
let socketInstance = null
const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:3000'

export const useSocketStore = create(
  devtools( (set, get) => ({
    onlineUsers: [],

    connectSocket: async (userId, getToken) => {
    // Nếu đã có kết nối, không tạo mới
      if (socketInstance) return

      socketInstance = io(API_ROOT, {
        auth: async (cb) => {
          const token = await getToken()
          cb({
            token, userId
          })
        },
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
        toast.error(error.message)
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

    manageSocket: async (userId, getToken) => {
    // Nếu có userId mới và đã có socket cũ
      if (userId && socketInstance) {
        // Kiểm tra xem ID có khớp không, nếu khác thì ngắt cũ để tạo mới cho user mới
        if (socketInstance.auth?.query?.userId !== userId) {
          get().disconnectSocket()
        }
      }
      // Thiết lập kết nối mới nếu có đủ thông tin và chưa có socketInstance
      if (userId && getToken && !socketInstance) {
        await get().connectSocket(userId, getToken)
      } else {
        get().disconnectSocket()
      }
    },

    // Getter để truy cập socket từ bên ngoài mà không cần qua State
    // Nên sử dụng useMemo ở component để chỉ lấy socket một lần duy nhất khi component mount
    getSocket: () => socketInstance
  }))

)