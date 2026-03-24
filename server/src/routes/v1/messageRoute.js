import express from 'express'
import { messageController } from '~/controllers/messageController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, messageController.sendMessage)

// Router.route('/group')
//   .post(authMiddleware.isAuthorized, messageController.sendGroupMessage)

export const messageRoute = Router