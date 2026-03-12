import { StatusCodes } from 'http-status-codes'
import { commentService } from '~/services/commentService'


const createNew = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const result = await commentService.createNew(userId, req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const createReply = async (req, res, next) => {
  try {
    const { replyContent, parentCommentId } = req.body
    const userId = req.authInfo.mongoId
    const result = await commentService.createReply(parentCommentId, replyContent, userId)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const getCommentsByPost = async (req, res, next) => {
  try {
    const { postId } = req.params
    const userId = req.authInfo.mongoId
    const result = await commentService.getCommentsByPost(postId, userId, req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const { commentId } = req.params
    const userId = req.authInfo.mongoId
    const { content, postId } = req.body
    const result = await commentService.update(commentId, postId, userId, content)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const toggleActive = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const { commentId } = req.params
    const result = await commentService.toggleActive(userId, commentId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const commentController = {
  createNew,
  update,
  createReply,
  getCommentsByPost,
  toggleActive
}