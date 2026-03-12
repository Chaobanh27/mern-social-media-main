import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import commentModel from '~/models/commentModel'
import postModel from '~/models/postModel'
import reactionModel from '~/models/reactionModel'
import userModel from '~/models/userModel'
import ApiError from '~/utils/ApiError'

const handleToggleReaction = async (targetId, userId, reqBody) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const existUser = await userModel.findById({ _id: userId }).session(session)
    const existComment = await commentModel.findById({ _id: targetId }).session(session)

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existComment) throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found!')

    const { reactionType, targetType } = reqBody

    const targetModel = (targetType === 'post') ? postModel : commentModel

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

      await targetModel.findByIdAndUpdate(
        targetId,
        { $inc: { [`reactionSummary.${reactionType}`]: 1 } },
        { session }
      )
      await session.commitTransaction()
      session.endSession()
      return { reactionType: reactionType }
    }

    //Trường hợp 2 : Click lại cùng 1 loại reaction
    if (oldReaction.reactionType === reactionType) {
      await reactionModel.deleteOne(
        { _id: oldReaction._id },
        { session: session }
      )

      await targetModel.findByIdAndUpdate(
        targetId,
        { $inc: { [`reactionSummary.${reactionType}`]: -1 } },
        { session }
      )
      await session.commitTransaction()
      session.endSession()
      return { reactionType: reactionType }
    }

    //Trường hợp 3 : Nếu như đổi reaction
    const oldReactionType = oldReaction.reactionType

    oldReaction.reactionType = reactionType

    await oldReaction.save({ session })

    await targetModel.findByIdAndUpdate(targetId, {
      $inc: {
        [`reactionSummary.${oldReactionType}`]: -1,
        [`reactionSummary.${reactionType}`]: 1
      }
    },
    { session }
    )

    await session.commitTransaction()
    session.endSession()
    return { from: oldReactionType, to: reactionType }

  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

export const reactionService = {
  handleToggleReaction
}