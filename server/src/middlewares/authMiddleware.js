/* eslint-disable no-console */
import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { logger } from '~/config/logger'
import userModel from '~/models/userModel'
import ApiError from '~/utils/ApiError'

const isAuthorized = async (req, res, next) => {
  try {
    // req.auth() sẽ tự quét Header Authorization và cả Cookies
    const auth = await req.auth()
    const { userId: clerkId } = auth

    // Log chi tiết để debug (Chỉ dùng trong môi trường dev)
    if (env.BUILD_MODE === 'dev') {
      // console.log('userId: ', userId)
      // console.log('sessionId: ', sessionId)
    }

    if (!clerkId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!')
    }

    const user = await userModel.findOne({ clerkId: clerkId }).lean()

    // Nếu không có userId, nghĩa là token không tồn tại hoặc đã hết hạn hoàn toàn
    if (!user) {
      // Trường hợp User có ở Clerk nhưng chưa có ở DB (hiếm gặp, hoặc do sync lỗi)
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found in system!')
    }

    req.authInfo = {
      clerkId: clerkId,
      mongoId: user._id.toString()
    }

    next()
  } catch (error) {
    // Nếu là ApiError mình chủ động throw ở trên thì pass tiếp cho Error Handler
    if (error instanceof ApiError) return next(error)

    // Clerk trả về lỗi nếu Token bị giả mạo hoặc sai Secret Key
    logger.error('Error from authMiddleware: ', error)

    // Trả về lỗi 401 cụ thể để Frontend Axios Interceptor bắt được và xử lý (ví dụ chuyển hướng login)
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (Token invalid)'))
  }
}

export const authMiddleware = {
  isAuthorized
}