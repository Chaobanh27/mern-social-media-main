import express from 'express'
import { postController } from '~/controllers/postController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, postController.createNew)
  .get(authMiddleware.isAuthorized, postController.getFeed)

export const postRoute = Router