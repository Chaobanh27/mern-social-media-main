/* eslint-disable no-useless-catch */

import { StatusCodes } from 'http-status-codes'
import userModel from '~/models/userModel'
import ApiError from '~/utils/ApiError'


const getUser = async (userId) => {
  try {
    const existUser = await userModel.findOne({ clerkId: userId })
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    return existUser
  } catch (error) {
    throw (error)
  }
}

export const userService = {
  getUser
}