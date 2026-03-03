import { StatusCodes } from 'http-status-codes'
import { postService } from '~/services/postService'

const createNew = async (req, res, next) => {
  try {
    const result = await postService.createNew(req.userId, req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const getFeed = async (req, res, next) => {
  try {
    console.log(req.userId);
    const result = await postService.getFeed(req.userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const postController = {
  createNew,
  getFeed
}