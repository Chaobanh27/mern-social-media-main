import express from 'express'
import { storyController } from '~/controllers/storyController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, storyController.createNew)
  .get(authMiddleware.isAuthorized, storyController.getStories)

export const storyRoute = Router