import express from 'express'
import { callController } from '~/controllers/callController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/token')
  .get(authMiddleware.isAuthorized, callController.getTwilioToken)


export const callRoute = Router