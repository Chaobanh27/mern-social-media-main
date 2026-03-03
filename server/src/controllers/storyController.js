import { StatusCodes } from 'http-status-codes'
import { storyService } from '~/services/storyService'

const createNew = async (req, res, next) => {
  try {
    const result = await storyService.createNew(req.userId, req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const getStories = async (req, res, next) => {
  try {
    const result = await storyService.getStories(req.userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const storyController = {
  createNew,
  getStories
}