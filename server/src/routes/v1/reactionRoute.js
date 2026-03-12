import express from 'express'
import { reactionController } from '~/controllers/reactionController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/:targetId')
  .post(authMiddleware.isAuthorized, reactionController.handleToggleReaction)

export const reactionRoute = Router