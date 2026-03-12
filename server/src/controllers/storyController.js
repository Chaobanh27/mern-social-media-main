import { StatusCodes } from 'http-status-codes'
import { storyService } from '~/services/storyService'

const createNew = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const result = await storyService.createNew(userId, req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const getStories = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const result = await storyService.getStories(userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const storyController = {
  createNew,
  getStories
}