/* eslint-disable no-console */
import { Server } from 'socket.io'
import { env } from '~/config/environment'
import { WHITELIST_DOMAINS } from '~/utils/constants'
import { catchAsyncEvents } from '~/utils/genericHelper'
import { verifyToken } from '@clerk/backend'
import userModel from '~/models/userModel'
import { logger } from '~/config/logger'

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

  // Middleware check auth
  io.use(async (socket, next) => {
    const { token, userId } = socket.handshake.auth

    if (!token || !userId) {
      const err = new Error('Unauthenticated')
      err.data = { message: 'Missing token or userId' }
      return next(err)
    }

    try {
    // Xác thực token với Clerk
      const sessionClaims = await verifyToken(token, {
        secretKey: env.CLERK_SECRET_KEY,
        authorizedParties: WHITELIST_DOMAINS
      })

      const clerkIdFromToken = sessionClaims.sub

      const user = await userModel.findOne({ clerkId: clerkIdFromToken })

      if (!user) {
        return next(new Error('User not found in database'))
      }

      // Kiểm tra tính chính chủ (sub trong Clerk chính là userId)
      if (user._id.toString() !== userId.toString()) {
        return next(new Error('User ID mismatch'))
      }

      // Lưu thông tin vào socket instance để dùng ở các event sau
      socket.userId = userId.toString()
      // Có thể lưu thêm claims nếu cần dùng email, role...
      socket.claims = sessionClaims

      // console.log('socket: ', socket)
      next()
    } catch (error) {
    // Nếu verifyToken thất bại (hết hạn, token giả...)
      console.error('[Auth Socket Error]:', error)
      const authError = new Error('Authentication failed')
      authError.data = { reason: error.message }
      next(authError)
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.userId
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
    socket.join(userId)
    //Tả về mảng các id của user đang online
    io.emit('getOnlineUsers', Array.from(userSocketMap.keys()))


    socket.on('join_chat', catchAsyncEvents(socket, async (conversationId) => {
      if (!conversationId) throw new Error('Conversation ID is required')
      await socket.join(conversationId.toString())
      console.log(`Socket ${socket.id} joined room: ${conversationId}`)
    }))

    socket.on('leave_chat', catchAsyncEvents(socket, async (conversationId) => {
      if (conversationId) {
        await socket.leave(conversationId.toString())
        console.log(`Socket ${socket.id} left room: ${conversationId}`)
      }
    }))

    // Khi user bắt đầu gõ
    socket.on('typing_start', catchAsyncEvents(socket, async ({ conversationId }) => {
    // Gửi cho tất cả mọi người trong phòng TRỪ người gửi (broadcast)
      socket.to(conversationId).emit('display_typing', {
        conversationId,
        userId,
        isTyping: true
      })
    }))

    // Khi user dừng gõ (sau 3s hoặc xóa hết text)
    socket.on('typing_stop', catchAsyncEvents(socket, async ({ conversationId }) => {
      socket.to(conversationId).emit('display_typing', {
        conversationId,
        isTyping: false
      })
    }))


    //Khi A bắt đầu gọi B
    socket.on('start_call', catchAsyncEvents(socket, async ({ toUserId, fromUser, roomName, callType }) => {
      if (!toUserId) throw new Error('Target User ID is required')
      //Emit sự kiện để bên B nhận cuộc gọi
      socket.to(toUserId.toString()).emit('incoming_call', { fromUser, roomName, callType })
      console.log(`Call signal from ${fromUser.username} to ${toUserId}`)
    }))

    //Khi B nghe máy
    socket.on('answer_call', catchAsyncEvents(socket, async ({ toUserId, roomName }) => {
      if (toUserId) {
        socket.to(toUserId.toString()).emit('call_accepted', { roomName })
      }
    }))

    //Khi B từ chối nghe máy
    socket.on('reject_call', catchAsyncEvents(socket, async ({ toUserId }) => {
      if (toUserId) {
        socket.to(toUserId.toString()).emit('call_rejected')
      }
    }))

    //Khi 1 trong A và B kết thúc cuộc gọi
    socket.on('end_call', catchAsyncEvents(socket, async ({ toUserId, roomName, duration }) => {
      if (toUserId) {
        socket.to(toUserId.toString()).emit('call_ended')
        //lưu vào MongoDB ngay tại đây hoặc đợi Webhook từ Twilio
        console.log(`Call in ${roomName} ended: ${duration}s`)
      }
    }))

    //Thông báo cho A hoặc B biết là share màn hình
    socket.on('screen_share_status', catchAsyncEvents(socket, async ({ toUserId, isSharing }) => {
      if (toUserId) {
        socket.to(toUserId.toString()).emit('on_screen_share_change', { isSharing })
      }
    }))


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

  logger.info('Socket.io initialized')
  return io
}

// Hàm để lấy io ở nơi khác (controller, service)
export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!')
  return io
}
