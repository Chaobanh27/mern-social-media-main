import { StatusCodes } from 'http-status-codes'
import { messageService } from '~/services/messageService'

const sendMessage = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const result = await messageService.sendMessage(userId, req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

// const sendGroupMessage = async (req, res, next) => {
//   try {
//     const userId = req.authInfo.mongoId
//     const result = await messageService.sendGroupMessage(userId, req.body)
//     res.status(StatusCodes.CREATED).json(result)
//   } catch (error) {
//     next(error)
//   }
// }

const getmessagesByConversationId = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const { conversationId } = req.params
    const result = await messageService.getmessagesByConversationId(userId, conversationId, req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const messageController = {
  sendMessage,
  // sendGroupMessage,
  getmessagesByConversationId
}