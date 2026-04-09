import express from 'express'
import { notificationController } from '~/controllers/notificationController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, notificationController.getNotificationsByUser)

Router.route('/mark-all-read')
  .put(authMiddleware.isAuthorized, notificationController.markAllRead)


export const notificationRoute = Router