import mongoose from 'mongoose'
import conversationModel from '~/models/conversationModel'
import conversationParticipantModel from '~/models/conversationParticipantModel'
import { getIO, userSocketMap } from '~/sockets'
import { getBaseConversationPipeline, getSingleFormattedConversation } from '~/utils/genericHelper'

const getConversations = async (userId, reqQuery) => {
  try {
    const { cursor, limit } = reqQuery
    const parsedLimit = parseInt(limit)

    const pipeLine = [
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'conversations',
          localField: 'conversation',
          foreignField: '_id',
          as: 'conversationInfo'
        }
      },
      { $unwind: '$conversationInfo' },

      ...((cursor && cursor !== 'null') ? [{
        $match: {
          'conversationInfo.updatedAt' : { $lt: new Date(cursor) }
        } }] : [] ),
      { $sort: { 'conversationInfo.updatedAt' : -1 } },
      { $limit: parsedLimit + 1 },

      //Bỏ 2 bước lookup conv đã làm ở trên
      ...getBaseConversationPipeline(userId).slice(2)
    ]

    const conversations = await conversationParticipantModel.aggregate(pipeLine)

    const hasMore = conversations.length > limit
    if (hasMore) conversations.pop()

    const nextCursor = hasMore ? conversations[conversations.length - 1].updatedAt : null

    return {
      data: conversations,
      nextCursor: nextCursor,
      hasMore: hasMore
    }
  } catch (error) {
    throw error
  }
}

const checkConversation = async (userId, reqBody) => {
  try {
    const senderObjId = new mongoose.Types.ObjectId(userId)
    const { receiverId } = reqBody
    const receiverObjId = new mongoose.Types.ObjectId(receiverId)
    let result

    let conversation = await conversationParticipantModel.aggregate([
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
    ])

    if (conversation.length > 0) {
      result = await getSingleFormattedConversation(receiverId, conversation[0]._id)
      return { hasConversation: true, conversation: result }
    }
    return { hasConversation: false }
  } catch (error) {
    throw error
  }
}

const createGroupConversation = async (userId, reqBody) => {
  try {
    const { userIds } = reqBody

    // Tạo mảng các id cảu member và admin dùng set để loại bỏ các id trùng nhau nếu có
    const allMemberIds = [...new Set([...userIds, userId])]

    const newGroupConversation = await conversationModel.create({
      name: 'new group',
      type: 'group',
      groupPicture: 'https://res.cloudinary.com/dbk1x83kg/image/upload/v1706293161/samples/breakfast.jpg'
    })

    const groupParticipants = allMemberIds.map(uId => ({
      conversation: newGroupConversation._id,
      user: uId,
      role: uId === userId ? 'admin' : 'member'
    }))

    await conversationParticipantModel.insertMany(groupParticipants)

    const result = await getSingleFormattedConversation(userId, newGroupConversation._id)


    allMemberIds.forEach(uId => {
      const memberSocketId = userSocketMap.get(uId)
      if (memberSocketId && memberSocketId.size > 0) {
        memberSocketId.forEach(socketId => {
          getIO().to(socketId ).emit('added_to_group', result)
          // Cho socket của member đó join vào phòng của Group
          const socketInstance = getIO().sockets.sockets.get(socketId )
          if (socketInstance) {
            socketInstance.join(result?._id?.toString())
          }
        })
      }
    })

    return result

  } catch (error) {
    throw error
  }
}

// const createNew = async (userId, reqBody) => {
//   try {
//     const senderObjId = new mongoose.Types.ObjectId(userId)
//     const { receiverId } = reqBody
//     const receiverObjId = new mongoose.Types.ObjectId(receiverId)
//     let result

//     let conversation = await conversationParticipantModel.aggregate([
//       { $match: { user: { $in: [senderObjId, receiverObjId] } } },
//       { $group: { _id: '$conversation', count: { $sum: 1 } } },
//       { $match: { count: 2 } }
//     ])

//     if (conversation.length > 0) {
//       result = await getSingleFormattedConversation(userId, conversation[0]._id)

//       return result
//     }

//     const newConversation = new conversationModel({
//       type: 'private'
//     })

//     await newConversation.save()

//     await conversationParticipantModel.insertMany([
//       { conversation: newConversation._id, user: userId },
//       { conversation: newConversation._id, user: receiverId }
//     ])

//     result = await getSingleFormattedConversation(userId, newConversation._id)

//     return result
//   } catch (error) {
//     throw error
//   }
// }

const markAsRead = async (userId, conversationId) => {
  try {
    await conversationParticipantModel.findOneAndUpdate(
      {
        conversation: conversationId,
        user: userId
      },
      {
        lastReadAt: new Date()
      },
      {
        new: true
      }
    )

    return { message: 'Marked as read' }
  } catch (error) {
    throw error
  }

}

export const conversationService = {
  getConversations,
  createGroupConversation,
  // createNew,
  checkConversation,
  markAsRead
}