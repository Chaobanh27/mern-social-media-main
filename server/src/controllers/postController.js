import { StatusCodes } from 'http-status-codes'
import { postService } from '~/services/postService'

const createNew = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const result = await postService.createNew(userId, req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const getPost = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const { postId } = req.params
    const result = await postService.getPost(userId, postId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getFeed = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const result = await postService.getFeed(userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const postController = {
  createNew,
  getPost,
  getFeed
}