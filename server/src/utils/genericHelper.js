import userModel from '~/models/userModel'
import crypto from 'crypto'
import dayjs from 'dayjs'
import ApiError from './ApiError'
import { StatusCodes } from 'http-status-codes'
import conversationParticipantModel from '~/models/conversationParticipantModel'
import mongoose from 'mongoose'

export const generateUniqueUsername = async (base) => {
  let username = base
  let counter = 1
  const existUsername = await userModel.exists({ normalizedUsername: username })

  while (existUsername) {
    username = `${base}_${counter}`
    counter++
  }

  return username
}

export const generatePublicId = (originalName) => {
  const ext = originalName.split('.').pop()
  const hash = crypto.randomBytes(16).toString('hex')
  return `${hash}.${ext}`
}

export const generateFolder = (mime) => {
  const type = mime.startsWith('video') ? 'videos' : 'images'
  const date = dayjs().format('YYYY/MM')
  return `${type}/${date}`
}

export const toggleActiveById = async (model, id, name) => {
  const doc = await model.findById(id)
  if (!doc) throw new ApiError(StatusCodes.NOT_FOUND, `${name} not found!`)

  const newStatus = !doc.isActive

  // 1. Nếu là comment cha, cập nhật trạng thái cho TẤT CẢ các reply con của nó
  if (name === 'comment' && !doc.parentComment) {
    await model.updateMany(
      { parentComment: id },
      { $set: { isActive: newStatus } }
    )
  }

  // 2. Cập nhật trạng thái cho chính nó (dù là cha hay con)
  doc.isActive = newStatus
  await doc.save()

  return doc
}


export const getBaseConversationPipeline = (userId) => {
  const userObjId = new mongoose.Types.ObjectId(userId)
  return [
    {
      $lookup: {
        from: 'conversations',
        localField: 'conversation',
        foreignField: '_id',
        as: 'conversationInfo'
      }
    },
    { $unwind: '$conversationInfo' },

    // Join lấy nội dung tin nhắn cuối để hiện preview
    {
      $lookup: {
        from: 'messages',
        localField: 'conversationInfo.lastMessage',
        foreignField: '_id',
        as: 'lastMessageDetails'
      }
    },
    { $unwind: { path: '$lastMessageDetails', preserveNullAndEmptyArrays: true } },

    // Đếm số tin chưa đọc
    {
      $lookup: {
        from: 'messages',
        let: { convId: '$conversation', lastRead: '$lastReadAt' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$conversation', '$$convId'] },
                  { $gt: ['$createdAt', '$$lastRead'] },
                  { $ne: ['$sender', userObjId] }
                ]
              }
            }
          },
          { $count: 'unreadCount' }
        ],
        as: 'unreadData'
      }
    },

    // Lấy thông tin người kia (Chỉ cần thiết cho chat 'private')
    {
      $lookup: {
        from: 'conversation_participants',
        let: { convId: '$conversation', type: '$conversationInfo.type' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$conversation', '$$convId'] },
                  { $eq: ['$$type', 'private'] },
                  { $ne: ['$user', userObjId] }
                ]
              }
            }
          },
          { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' } },
          { $unwind: '$userInfo' }
        ],
        as: 'otherParticipants'
      }
    },

    // Chỉ định các trường cụ thể cần lấy hoặc loại bỏ khỏi tài liệu
    {
      $project: {
        _id: '$conversation',
        type: '$conversationInfo.type',
        receiverId: {
          $cond: {
            if: { $eq: ['$conversationInfo.type', 'private'] },
            then: { $arrayElemAt: ['$otherParticipants.userInfo._id', 0] },
            else: '$conversationInfo._id'
          }
        },
        // Nếu là Group thì lấy name của Group, nếu là Private thì lấy name của người kia
        username: {
          $cond: {
            if: { $eq: ['$conversationInfo.type', 'private'] },
            then: { $arrayElemAt: ['$otherParticipants.userInfo.username', 0] },
            else: '$conversationInfo.name'
          }
        },
        profilePicture: {
          $cond: {
            if: { $eq: ['$conversationInfo.type', 'private'] },
            then: { $arrayElemAt: ['$otherParticipants.userInfo.profilePicture', 0] },
            else: '$conversationInfo.groupPicture'
          }
        },
        lastMessage: {
          content: '$lastMessageDetails.content',
          media: '$lastMessageDetails.media',
          giphy: '$lastMessageDetails.giphy',
          sender: '$lastMessageDetails.sender',
          createdAt: '$lastMessageDetails.createdAt'
        },
        unreadCount: { $ifNull: [{ $arrayElemAt: ['$unreadData.unreadCount', 0] }, 0] },
        updatedAt: '$conversationInfo.updatedAt' // Sort theo sự thay đổi của cuộc hội thoại
      }
    },
    { $sort: { updatedAt: -1 } }
  ]
}


export const getSingleFormattedConversation = async (userId, conversationId) => {
  const pipiline = [
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        conversation: new mongoose.Types.ObjectId(conversationId)
      }
    },
    ...getBaseConversationPipeline(userId)
  ]

  const result = await conversationParticipantModel.aggregate(pipiline)

  return result[0]
}

// export const getFormattedConversation = async (userId, conversationId) => {
//   const query = {
//     user: userId
//   }

//   if (conversationId) {
//     query.conversation = conversationId
//   }

//   const result = await conversationParticipantModel.aggregate([
//     // Lọc theo điều kiện
//     { $match: query },
//     // Join với bảng conversation để lấy thông tin conversation
//     {
//       $lookup: {
//         from: 'conversations',
//         localField: 'conversation',
//         foreignField: '_id',
//         as: 'conversationInfo'
//       }
//     },
//     { $unwind: '$conversationInfo' },

//     // Join lấy nội dung tin nhắn cuối để hiện preview
//     {
//       $lookup: {
//         from: 'messages',
//         localField: 'conversationInfo.lastMessage',
//         foreignField: '_id',
//         as: 'lastMessageDetails'
//       }
//     },
//     { $unwind: { path: '$lastMessageDetails', preserveNullAndEmptyArrays: true } },

//     // Đếm số tin chưa đọc (Giữ nguyên logic đỉnh cao của bạn)
//     {
//       $lookup: {
//         from: 'messages',
//         let: { convId: '$conversation', lastRead: '$lastReadAt' },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ['$conversation', '$$convId'] },
//                   { $gt: ['$createdAt', '$$lastRead'] },
//                   { $ne: ['$sender', userId] }
//                 ]
//               }
//             }
//           },
//           { $count: 'unreadCount' }
//         ],
//         as: 'unreadData'
//       }
//     },

//     // Lấy thông tin người kia (Chỉ cần thiết cho chat 'private')
//     {
//       $lookup: {
//         from: 'conversation_participants',
//         let: { convId: '$conversation', type: '$conversationInfo.type' },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ['$conversation', '$$convId'] },
//                   { $eq: ['$$type', 'private'] },
//                   { $ne: ['$user', userId] }
//                 ]
//               }
//             }
//           },
//           { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' } },
//           { $unwind: '$userInfo' }
//         ],
//         as: 'otherParticipants'
//       }
//     },

//     // Chỉ định các trường (fields) cụ thể cần lấy hoặc loại bỏ khỏi tài liệu
//     {
//       $project: {
//         _id: '$conversation',
//         type: '$conversationInfo.type',
//         receiverId: {
//           $cond: {
//             if: { $eq: ['$conversationInfo.type', 'private'] },
//             then: { $arrayElemAt: ['$otherParticipants.userInfo._id', 0] },
//             else: '$conversationInfo._id'
//           }
//         },
//         // Nếu là Group thì lấy name của Group, nếu là Private thì lấy name của người kia
//         username: {
//           $cond: {
//             if: { $eq: ['$conversationInfo.type', 'private'] },
//             then: { $arrayElemAt: ['$otherParticipants.userInfo.username', 0] },
//             else: '$conversationInfo.name'
//           }
//         },
//         profilePicture: {
//           $cond: {
//             if: { $eq: ['$conversationInfo.type', 'private'] },
//             then: { $arrayElemAt: ['$otherParticipants.userInfo.profilePicture', 0] },
//             else: '$conversationInfo.groupPicture'
//           }
//         },
//         lastMessage: {
//           content: '$lastMessageDetails.content',
//           sender: '$lastMessageDetails.sender',
//           createdAt: '$lastMessageDetails.createdAt'
//         },
//         unreadCount: { $ifNull: [{ $arrayElemAt: ['$unreadData.unreadCount', 0] }, 0] },
//         updatedAt: '$conversationInfo.updatedAt' // Sort theo sự thay đổi của cuộc hội thoại
//       }
//     },
//     { $sort: { updatedAt: -1 } }
//   ])

//   return result
// }

// utils/errorHandler.js


export const catchAsyncEvents = (socket, fn) => {
  return (...args) => {
    // args là các tham số client gửi lên (data, callback...)
    Promise.resolve(fn(...args)).catch((err) => {
      console.error(`[Socket Error] Event: ${fn.name || 'anonymous'} | User: ${socket.userId}`, err)

      // Gửi thông báo lỗi về cho riêng Client đó
      socket.emit('error_response', {
        message: err.message || 'Internal Server Error',
        code: err.code || 500
      })

      // Nếu Client có gửi kèm callback (ack), hãy gọi nó với lỗi
      const lastArg = args[args.length - 1]
      if (typeof lastArg === 'function') {
        lastArg({ error: err.message })
      }
    })
  }
}

export const getParticipants = async (conversationId) => {
  const participants = await conversationParticipantModel.aggregate([
    {
      $match: { conversation: new mongoose.Types.ObjectId(conversationId) }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: '$userInfo' },
    {
      $project: {
        _id: 0,
        userId: '$userInfo._id',
        username: '$userInfo.username',
        role: 1,
        joinedAt: 1
      }
    }
  ])

  return participants
}