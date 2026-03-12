import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import mediaModel from '~/models/mediaModel'
import postModel from '~/models/postModel'
import userModel from '~/models/userModel'
import ApiError from '~/utils/ApiError'


const createNew = async (userId, reqBody) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const existUser = await userModel.findById({ _id: userId })
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    const { content, background, postType, visibility, media } = reqBody

    const newPost = new postModel({
      user: existUser._id,
      content,
      postType: postType,
      visibility: visibility,
      background: background,
      media: []
    })

    await newPost.save({ session })

    const newMedia = media.map((item, index) => ({
      user: existUser._id,
      targetId: newPost._id,
      targetType: 'post',
      url: item.url,
      hlsUrl: item.hlsUrl,
      mimeType: item.mimeType,
      size: item.size,
      type: item.type,
      metadata: item.metadata,
      storage: item.storage,
      order: index
    }))

    const savedMedia = await mediaModel.insertMany(newMedia, { session })

    newPost.media = savedMedia.map(item => item._id)

    await newPost.save({ session })

    await newPost.populate([
      {
        path: 'user',
        select: 'username profilePicture'
      }, {
        path: 'media'
      }
    ])

    await session.commitTransaction()
    session.endSession()

    return newPost

  } catch (error) {
    // Nếu có lỗi, hủy bỏ toàn bộ thay đổi trong DB
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

const getPost = async (userId, postId) => {
  try {
    const existUser = await userModel.findById({ _id: userId })
    const existPost = await postModel.findById({ _id: postId }).populate([
      {
        path: 'user',
        select: 'username profilePicture email'
      },
      {
        path: 'media'
      }
    ]

    )
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existPost) throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found!')

    return existPost
  } catch (error) {
    throw error
  }
}

const getFeed = async (userId) => {
  try {
    const existUser = await userModel.findById({ _id: userId })
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    const feed = await postModel.find({ visibility: 'public', isActive: true }).populate([
      {
        path: 'user',
        select: 'username profilePicture'
      }, {
        path: 'media'
      }
    ])

    return feed
  } catch (error) {
    throw error
  }
}

export const postService = {
  createNew,
  getPost,
  getFeed
}