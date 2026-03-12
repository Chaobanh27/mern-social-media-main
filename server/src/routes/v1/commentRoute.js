import express from 'express'
import { commentController } from '~/controllers/commentController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, commentController.createNew)

Router.route('/reply')
  .post(authMiddleware.isAuthorized, commentController.createReply)

Router.route('/:commentId')
  .put(authMiddleware.isAuthorized, commentController.update)
  .patch(authMiddleware.isAuthorized, commentController.toggleActive)

Router.route('/by-post/:postId')
  .get(authMiddleware.isAuthorized, commentController.getCommentsByPost)

export const commentRoute = Router