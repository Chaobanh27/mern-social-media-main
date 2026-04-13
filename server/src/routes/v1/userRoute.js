import express from 'express'
import { userController } from '~/controllers/userController'
import { authMiddleware } from '~/middlewares/authMiddleware'


const Router = express.Router()

Router.route('/me')
  .get(authMiddleware.isAuthorized, userController.getMe)

Router.route('/')
  .get(authMiddleware.isAuthorized, userController.getUsers)

Router.route('/:userId')
  .get(authMiddleware.isAuthorized, userController.getUserById)


export const userRoute = Router
