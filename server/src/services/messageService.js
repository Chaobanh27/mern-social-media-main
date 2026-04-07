import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import conversationModel from '~/models/conversationModel'
import conversationParticipantModel from '~/models/conversationParticipantModel'
import giphyModel from '~/models/giphyModel'
import mediaModel from '~/models/mediaModel'
import messageModel from '~/models/messageModel'
import reactionModel from '~/models/reactionModel'
import userModel from '~/models/userModel'
import { getIO } from '~/sockets'
import ApiError from '~/utils/ApiError'


const sendMessage = async (userId, reqBody) => {
  const { message, media, messageType, gif, receiverId, conversationId, conversationType, socketId } = reqBody

  // Validate sớm để tránh khởi tạo Session lãng phí
  if (media && media.length > 10) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You can only upload up to 10 media files.')
  }

  if (!message && !gif && (!media || media.length === 0)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Message cannot be empty.')
  }


  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const existUser = await userModel.findById({ _id: userId }).session(session)
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    const io = getIO()
    const senderId = userId
    const currentSocket = io.sockets.sockets.get(socketId)
    let isNewConversation = false
    let finalConvId = conversationId

    // XỬ LÝ CONVERSATION (Chỉ dành cho Private chat mới)
    if (!finalConvId && receiverId) {
      const senderObjId = new mongoose.Types.ObjectId(senderId)
      const receiverObjId = new mongoose.Types.ObjectId(receiverId)

      // Tìm conversation private hiện có
      let existingConversation = await conversationParticipantModel.aggregate([
      // 1. Tìm các bản ghi tham gia của 2 user này
        {
          $match: {
            user: { $in: [senderObjId, receiverObjId] }
          }
        },
        // 2. Nhóm theo conversation ID để đếm số lượng khớp
        {
          $group: {
            _id: '$conversation',
            count: { $sum: 1 }
          }
        },
        // 3. Chỉ lấy những conversation mà cả 2 user cùng tham gia (count = 2)
        {
          $match: { count: 2 }
        },
        // 4. Join với bảng conversations để kiểm tra Type
        {
          $lookup: {
            from: 'conversations', // Tên collection conversation trong DB
            localField: '_id',
            foreignField: '_id',
            as: 'conversationInfo'
          }
        },
        // 5. Giải nén array từ lookup
        { $unwind: '$conversationInfo' },
        // 6. LỌC THEO TYPE Ở ĐÂY
        {
          $match: {
            'conversationInfo.type': 'private' // Hoặc loại bạn quy định
          }
        }
      ]).session(session)

      if (existingConversation.length > 0) {
        finalConvId = existingConversation[0]._id
      } else {
        isNewConversation = true
        // Tạo mới hoàn toàn nếu chưa có
        const [newConversation] = await conversationModel.create([{ type: 'private' }], { session })
        await conversationParticipantModel.insertMany([
          { conversation: newConversation._id, user: senderId },
          { conversation: newConversation._id, user: receiverId }
        ], { session })
        finalConvId = newConversation._id
      }
    }

    if (!finalConvId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Conversation ID or Receiver ID is required')
    }

    const messageId = new mongoose.Types.ObjectId()

    let savedMediaIds = []
    if (media && media.length > 0) {
      const mediaDocs = media.map((item, index) => ({
        user: senderId,
        targetId: messageId,
        targetType: 'message',
        url: item.url,
        mimeType: item.mimeType,
        size: item.size,
        type: item.type,
        metadata: item.metadata,
        storage: item.storage,
        order: index
      }))

      const savedMedia = await mediaModel.insertMany(mediaDocs, { session })
      savedMediaIds = savedMedia.map(m => m._id)
    }

    let gifId = null
    if (gif) {
      // Đồng bộ GIF vào kho dữ liệu Giphy
      const giphyDoc = await giphyModel.findOneAndUpdate(
        { giphyId: gif.id }, // Tìm theo ID của Giphy
        {
          giphyId: gif.id,
          title: gif.title,
          type: gif.type || 'gif',
          url: gif.url,
          webp: gif.webp,
          still: gif.still,
          width: gif.width,
          height: gif.height
        },
        { upsert: true, new: true, session }
      )
      gifId = giphyDoc._id
    }

    // TẠO VÀ LƯU TIN NHẮN
    const [newMessage] = await messageModel.create([{
      conversation: finalConvId,
      sender: senderId,
      content: message,
      messageType: messageType,
      giphy: gifId,
      media: savedMediaIds
    }], { session })

    // Populate thông tin người gửi để FE hiển thị ngay lập tức
    const populatedMessage = await newMessage.populate([
      {
        path: 'sender',
        select: 'username profilePicture email'
      },
      {
        path: 'media'
      },
      {
        path: 'giphy'
      }
    ])

    //  CẬP NHẬT TRẠNG THÁI HỘI THOẠI
    await conversationModel.findByIdAndUpdate(finalConvId, {
      lastMessage: newMessage._id,
      updatedAt: new Date()
    }, { session })

    await session.commitTransaction()
    session.endSession()

    // XỬ LÝ SOCKET REAL-TIME
    // Cách tiếp cận tốt nhất: Dùng Room cho cả hai loại
    // 1. Nếu là Group: Gửi vào room có tên là finalConvId
    // 2. Nếu là Private: Gửi cho người nhận cụ thể
    // Lưu ý: Cả người gửi và người nhận nên join vào room có tên là conversationId khi mở app

    const participants = await conversationParticipantModel.find({
      conversation: finalConvId
    }).select('user')

    const lastMessageContent = messageType === 'text' ? message : `Sent a ${messageType}`

    if (conversationType === 'group' ) {
      participants.forEach(p => {
        const pId = p.user.toString()
        if (pId === senderId.toString() && currentSocket) {
          currentSocket.to(pId).emit('new_message', populatedMessage)
        } else {
          io.to(pId).emit('new_message', populatedMessage)
        }
      })
      // participants.forEach(p => {
      //   const memberSocketIds = userSocketMap.get(p.user.toString())
      //   if (memberSocketIds) {
      //     memberSocketIds.forEach(socketId => {
      //       io.to(socketId).emit('new_message', populatedMessage)
      //     })
      //   }
      // })
    }

    if (receiverId && conversationType === 'private') {

      if (isNewConversation) {
        const conversation = {
          _id: finalConvId,
          type: 'private',
          username: populatedMessage.sender.username,
          profilePicture: populatedMessage.sender.profilePicture,
          receiverId: senderId,
          lastMessage: {
            content: lastMessageContent,
            sender: senderId,
            createdAt: populatedMessage.createdAt
          },
          unreadCount: 1,
          updatedAt: populatedMessage.createdAt
        }
        io.to(receiverId.toString()).emit('new_conversation', conversation)
      }

      io.to(receiverId.toString()).emit('new_message', populatedMessage)
      if (currentSocket) {
        currentSocket.to(senderId.toString()).emit('new_message', populatedMessage)
      }
    }

    return {
      newMessage: populatedMessage,
      conversationId: finalConvId
    }

  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

const getmessagesByConversationId = async (userId, conversationId, reqQuery) => {
  try {
    const existUser = await userModel.findById({ _id: userId })
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    const { cursor, limit = 20 } = reqQuery
    const parsedLimit = parseInt(limit)
    const query = { conversation: new mongoose.Types.ObjectId(conversationId) }

    if (cursor && cursor !== 'null' && !isNaN(Date.parse(cursor))) {
      query.createdAt = { $lt: new Date(cursor) }
    }

    const messages = await messageModel.find(query)
      .sort({ createdAt: -1 })
      .limit(parsedLimit + 1)
      .populate({
        path: 'sender',
        select: 'username profilePicture email'
      })
      .populate('media')
      .populate('giphy')
      /// Dùng .lean() để tăng tốc độ truy vấn (trả về POJO thay vì Mongoose Document)
      .lean()

    //Tìm các bản ghi có userId trùng với id của bản thân và có targetId lất tất cả cmt cha và con
    const messageIds = messages.map(m => m._id)
    let myReactions = []
    if (userId) {
      myReactions = await reactionModel.find({
        user: userId,
        targetType: 'message',
        targetId: { $in: [...messageIds] }
      })
        .lean()
    }

    const reactionMap = new Map(myReactions.map(r => [r.targetId.toString(), r.reactionType]))

    let hasMore = false
    let nextCursor = null

    if (messages.length > parsedLimit) {
      hasMore = true
      // Phần tử cuối cùng chính là "kẻ dư thừa" dùng để check hasMore
      // Chúng ta lấy phần tử THỨ LIMIT để làm cursor cho trang sau
      // nextCursor = messages[parsedLimit - 1].createdAt
      nextCursor = messages[parsedLimit].createdAt
      // Loại bỏ phần tử dư thừa (phần tử thứ limit + 1)
      messages.pop()
    }

    const result = messages.map(m => ({
      ...m,
      myReaction: reactionMap.get(m._id.toString()) || null
    }))

    return {
      data: result,
      nextCursor : nextCursor,
      hasMore: hasMore
    }
  } catch (error) {
    throw error
  }
}

export const messageService = {
  sendMessage,
  getmessagesByConversationId
}