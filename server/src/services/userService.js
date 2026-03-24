/* eslint-disable no-useless-catch */

import { StatusCodes } from 'http-status-codes'
import userModel from '~/models/userModel'
import ApiError from '~/utils/ApiError'


const getUser = async (userId) => {
  try {
    const existUser = await userModel.findById({ _id: userId })
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    return existUser
  } catch (error) {
    throw (error)
  }
}

const getUsers = async (userId) => {
  try {
    const existUser = await userModel.findById({ _id: userId })
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    const users = await userModel.find({ _id: { $ne: userId } }).select('username profilePicture email')

    return users
  } catch (error) {
    throw (error)
  }
}

const getUserById = async (userId) => {
  try {
    const existUser = await userModel.findById({ _id: userId })
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    return existUser
  } catch (error) {
    throw (error)
  }
}

export const userService = {
  getUser,
  getUsers,
  getUserById
}