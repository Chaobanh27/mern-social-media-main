import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'


const getMe = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const result = await userService.getMe(userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getUsers = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const result = await userService.getUsers(userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params
    const result = await userService.getUserById(userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  getMe,
  getUsers,
  getUserById
}