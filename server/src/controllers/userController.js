import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'


const getUser = async (req, res, next) => {
  try {
    const { userId } = req.auth()
    const result = await userService.getUser(userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  getUser
}