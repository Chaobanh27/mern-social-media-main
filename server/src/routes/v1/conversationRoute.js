import express from 'express'
import { conversationController } from '~/controllers/conversationController'
import { messageController } from '~/controllers/messageController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, conversationController.getConversations)
  // .post(authMiddleware.isAuthorized, conversationController.createNew)

Router.route('/group')
  .post(authMiddleware.isAuthorized, conversationController.createGroupConversation)

Router.route('/check')
  .post(authMiddleware.isAuthorized, conversationController.checkConversation)

Router.route('/:conversationId/messages')
  .get(authMiddleware.isAuthorized, messageController.getmessagesByConversationId)

Router.route('/:conversationId')
  .put(authMiddleware.isAuthorized, conversationController.markAsRead)

export const conversationRoute = Router