import { StatusCodes } from 'http-status-codes'
import { reactionService } from '~/services/reactionService'

const handleToggleReaction = async (req, res, next) => {
  try {
    const { targetId } = req.params
    const userId = req.authInfo.mongoId
    const result = await reactionService.handleToggleReaction(targetId, userId, req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

export const reactionController = {
  handleToggleReaction
}