import express from 'express'
import { postController } from '~/controllers/postController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, postController.createNew)
  .get(authMiddleware.isAuthorized, postController.getFeed)

Router.route('/:userId')
  .get(authMiddleware.isAuthorized, postController.getPostsByUser)

Router.route('/:postId')
  .get(authMiddleware.isAuthorized, postController.getPost)
  .patch(authMiddleware.isAuthorized, postController.pinPost)

Router.route('/bookmark/:postId')
  .post(authMiddleware.isAuthorized, postController.toggleBookmark)

Router.route('/bookmark')
  .get(authMiddleware.isAuthorized, postController.getBookmarks)


export const postRoute = Router