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

const getPostsByUser = async (req, res, next) => {
  try {
    const currentUserId = req.authInfo.mongoId
    const { userId } = req.params
    const result = await postService.getPostsByUser(currentUserId, userId, req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getFeed = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const result = await postService.getFeed(userId, req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const pinPost = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const { postId } = req.params
    const result = await postService.pinPost(userId, postId)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const toggleBookmark = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const { postId } = req.params
    const result = await postService.toggleBookmark(userId, postId)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const getBookmarks = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const result = await postService.getBookmarks(userId, req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const postController = {
  createNew,
  getPost,
  getPostsByUser,
  getFeed,
  pinPost,
  toggleBookmark,
  getBookmarks
}