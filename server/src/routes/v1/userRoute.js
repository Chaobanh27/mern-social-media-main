import express from 'express'
import { userController } from '~/controllers/userController'
import { authMiddleware } from '~/middlewares/authMiddleware'


const Router = express.Router()

Router.route('/me')
  .get(authMiddleware.isAuthorized, userController.getUser)


export const userRoute = Router
