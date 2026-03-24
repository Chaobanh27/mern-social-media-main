/* eslint-disable no-console */
import { Server } from 'socket.io'
import { WHITELIST_DOMAINS } from '~/utils/constants'

let io
// Dùng Map để biết ai đang online (chỉ lưu số lượng socket của họ để tiết kiệm RAM)
export const userSocketMap = new Map()

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: WHITELIST_DOMAINS,
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId
    console.log('UserId Connected:', userId)

    // Chặn nếu không có userId
    if (!userId) return socket.disconnect()

    //Kiêm tra có Key userId tồn tại không
    if (!userSocketMap.has(userId)) {
      //Nếu chưa có thì tạo mới
      userSocketMap.set(userId, new Set())
    }

    //Nếu có rồi thì thêm socket.id vào key userId
    userSocketMap.get(userId).add(socket.id)

    //Sử dụng userId để bất kể user ở đâu (dùng cho: tin nhắn mới, thông báo, cuộc gọi đến)
    //Dùng conversationid để quản lý ngữ cảnh chỉ tồn tại khi user thực sự mở của sổ chả đó (dùng cho Typing, seen, online status)
    socket.join(userId.toString())
    //Tả về mảng các id của user đang online
    io.emit('getOnlineUsers', Array.from(userSocketMap.keys()))


    socket.on('join_chat', (conversationId) => {
      if (conversationId) {
        socket.join(conversationId.toString())
        console.log(`Socket ${socket.id} joined room: ${conversationId}`)
      }
    })

    socket.on('leave_chat', (conversationId) => {
      if (conversationId) {
        socket.leave(conversationId.toString())
        console.log(`Socket ${socket.id} left room: ${conversationId}`)
      }
    })

    // Khi user bắt đầu gõ
    socket.on('typing_start', ({ conversationId, userId }) => {
    // Gửi cho tất cả mọi người trong phòng TRỪ người gửi (broadcast)
      socket.to(conversationId).emit('display_typing', {
        conversationId,
        userId,
        isTyping: true
      })
    })

    // Khi user dừng gõ (sau 3s hoặc xóa hết text)
    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(conversationId).emit('display_typing', {
        conversationId,
        isTyping: false
      })
    })



    /*
    Nếu user ngắt kết nối thì phải tìm xem trong MAP có tồn tại
    userId đó không, nếu có thì xóa socket đang tồn tại của userId đó
    và kiểm tra thêm nếu không còn cặp key-value vào của userId đó => chứng tỏ
    userId đó không còn online trên tab nào nữa thì mới xóa cái key userId của user đó
    => user đó không còn online
    */
    socket.on('disconnect', () => {
      if (userId && userSocketMap.has(userId)) {
        userSocketMap.get(userId).delete(socket.id)
        if (userSocketMap.get(userId).size === 0) {
          userSocketMap.delete(userId)
        }
      }
      console.log('Map disconnect:', userSocketMap)
      //Cuối cùng trả về mảng các id của user đang online
      io.emit('getOnlineUsers', Array.from(userSocketMap.keys()))
    })
  })

  console.log('Socket.io initialized')
  return io
}

// Hàm an toàn để lấy io ở nơi khác (controller, service)
export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!')
  return io
}
