
import { StatusCodes } from 'http-status-codes'
import { logger } from '~/config/logger'
import ApiError from '~/utils/ApiError'

const isAuthorized = async (req, res, next) => {
  try {
    const { userId } = await req.auth()
    if (!userId) {
      next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
      return
    }
    next()
  } catch (error) {
    logger.error('Error from authMiddleware: ', error)
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}