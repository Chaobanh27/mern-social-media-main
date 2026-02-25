import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { logger } from '~/config/logger'
import { userRoute } from './userRoute'
import { testRoute } from './testRoute'
import { signRoute } from './signedUploadRoute'
import { postRoute } from './postRoute'

const Router = express.Router()
/**
 * @swagger
 * /status:
 *   get:
 *     summary: kiểm tra kết nối
 *     tags: [Status]
 *     responses:
 *       200:
 *         description: Thành công
 */
Router.get('/status', (req, res) => {
  logger.info('api v1 is ready to use')
  res.status(StatusCodes.OK).json({ message: 'api v1 is ready to use' })
})


Router.use('/users', userRoute)
Router.use('/upload', signRoute)
Router.use('/posts', postRoute)
Router.use('/tests', testRoute)

export const API_V1 = Router