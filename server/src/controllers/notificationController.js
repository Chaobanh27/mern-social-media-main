import { StatusCodes } from 'http-status-codes'
import { notificationService } from '~/services/notificationService'

const getNotificationsByUser = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const result = await notificationService.getNotificationsByUser(userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const markAllRead = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const result = await notificationService.markAllRead(userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const notificationController = {
  getNotificationsByUser,
  markAllRead
}