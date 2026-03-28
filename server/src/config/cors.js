import { env } from '~/config/environment'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { WHITELIST_DOMAINS } from '~/utils/constants'

// export const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin && env.BUILD_MODE === 'dev') {
//       return callback(null, true)
//     }

//     if (WHITELIST_DOMAINS.includes(origin)) {
//       return callback(null, true)
//     }

//     return callback(new ApiError(StatusCodes.FORBIDDEN, `${origin} not allowed by our CORS Policy.`))
//   },

//   optionsSuccessStatus: 200,
//   credentials: true
// }

export const corsOptions = {
  origin: function (origin, callback) {
    // 1. CHỈNH SỬA TẠI ĐÂY: Cho phép request không có origin
    // (Render Health Check, Postman, hoặc Server-to-Server)
    if (!origin) {
      return callback(null, true)
    }

    // 2. Kiểm tra domain từ trình duyệt (Client)
    if (WHITELIST_DOMAINS.includes(origin)) {
      return callback(null, true)
    }

    // 3. Nếu không khớp, trả về lỗi
    return callback(new ApiError(StatusCodes.FORBIDDEN, `${origin} not allowed by our CORS Policy.`))
  },
  optionsSuccessStatus: 200,
  credentials: true
}
