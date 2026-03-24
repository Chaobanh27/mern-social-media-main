import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'


const getUser = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const result = await userService.getUser(userId)
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
  getUser,
  getUsers,
  getUserById
}