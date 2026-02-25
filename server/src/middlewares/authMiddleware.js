/* eslint-disable no-console */
import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { logger } from '~/config/logger'
import ApiError from '~/utils/ApiError'

const isAuthorized = async (req, res, next) => {
  try {
    // req.auth() sẽ tự quét Header Authorization và cả Cookies
    const auth = await req.auth()
    const { userId, sessionId } = auth

    // Log chi tiết để debug (Chỉ dùng trong môi trường dev)
    if (env.BUILD_MODE === 'dev') {
      console.log('userId: ', userId)
      console.log('sessionId: ', sessionId)
    }

    // Nếu không có userId, nghĩa là token không tồn tại hoặc đã hết hạn hoàn toàn
    if (!userId) {
      return next(
        new ApiError(
          StatusCodes.UNAUTHORIZED, 
          'Unauthorized! (Phiên làm việc không tồn tại hoặc đã hết hạn)'
        )
      )
    }

    req.userId = userId

    next()
  } catch (error) {
    // Clerk trả về lỗi nếu Token bị giả mạo hoặc sai Secret Key
    logger.error('Error from authMiddleware: ', error)

    // Trả về lỗi 401 cụ thể để Frontend Axios Interceptor bắt được và xử lý (ví dụ chuyển hướng login)
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (Token invalid)'))
  }
}

export const authMiddleware = {
  isAuthorized
}