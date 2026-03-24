import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import commentModel from '~/models/commentModel'
import messageModel from '~/models/messageModel'
import postModel from '~/models/postModel'
import reactionModel from '~/models/reactionModel'
import storyModel from '~/models/storyModel'
import userModel from '~/models/userModel'
import { getIO } from '~/sockets'
import ApiError from '~/utils/ApiError'

const handleToggleReaction = async (targetId, userId, reqBody) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const existUser = await userModel.findById({ _id: userId }).session(session)

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    const io = getIO()
    let updateData = {}
    let finalReactionType = reactionType

    const { reactionType, targetType, conversationId, socketId } = reqBody

    let targetModel
    switch (targetType) {
    case 'post':
      targetModel = postModel
      break
    case 'comment':
      targetModel = commentModel
      break
    case 'message':
      targetModel = messageModel
      break
    case 'story' :
      targetModel = storyModel
      break
    default:
      break
    }

    const existTarget = await targetModel.findById({ _id: targetId }).session(session)
    if (!existTarget) throw new ApiError(StatusCodes.NOT_FOUND, 'Not found!')

    const oldReaction = await reactionModel.findOne({
      user: userId,
      targetId: targetId,
      targetType: targetType
    }).session(session)


    //Trường hợp 1 : Nếu chưa có reaction thì tạo mới
    if (!oldReaction) {
      await reactionModel.create([{
        user: userId,
        targetId: targetId,
        targetType: targetType,
        reactionType: reactionType
      }], { session })
      updateData = { $inc: { [`reactionSummary.${reactionType}`]: 1 } }
    }

    //Trường hợp 2 : Click lại cùng 1 loại reaction
    else if (oldReaction.reactionType === reactionType) {
      await reactionModel.deleteOne(
        { _id: oldReaction._id },
        { session: session }
      )
      updateData = { $inc: { [`reactionSummary.${reactionType}`]: -1 } }
      finalReactionType = null
    }
    //Trường hợp 3 : Nếu như đổi reaction
    else {
      const oldReactionType = oldReaction.reactionType

      oldReaction.reactionType = reactionType

      await oldReaction.save({ session })

      updateData = { $inc: { [`reactionSummary.${oldReactionType}`]: -1, [`reactionSummary.${reactionType}`]: 1 } }
    }

    const result = await targetModel.findByIdAndUpdate(targetId, updateData, { new: true, session })

    await session.commitTransaction()
    session.endSession()

    //Chỉ gửi cho receiver nếu receiver đang ở trong conversation
    //Gửi cho tất cả thiết bị hay Tab của sender đang có ngoại trừ tab hoặc thiết bị đang gửi
    if (targetType === 'message' && conversationId && socketId) {
      io.to(conversationId.toString()).except(socketId).emit('message_reaction', {
        targetId,
        conversationId,
        data: result
      })
    }
    return { data: result, reactionType: finalReactionType }

  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

export const reactionService = {
  handleToggleReaction
}