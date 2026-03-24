import { StatusCodes } from 'http-status-codes'
import { conversationService } from '~/services/conversationService'

const getConversations = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const result = await conversationService.getConversations(userId, req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const checkConversation = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const result = await conversationService.checkConversation(userId, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const createGroupConversation = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const result = await conversationService.createGroupConversation(userId, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

// const createNew = async (req, res, next) => {
//   try {
//     const userId = req.authInfo.mongoId
//     const result = await conversationService.createNew(userId, req.body)
//     res.status(StatusCodes.OK).json(result)
//   } catch (error) {
//     next(error)
//   }
// }

const markAsRead = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const { conversationId } = req.params
    const result = await conversationService.markAsRead(userId, conversationId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const conversationController = {
  getConversations,
  createGroupConversation,
  // createNew,
  checkConversation,
  markAsRead
}