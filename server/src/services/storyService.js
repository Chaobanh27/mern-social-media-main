import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import mediaModel from '~/models/mediaModel'
import storyModel from '~/models/storyModel'
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
    const { content, background, storyType, visibility, media } = reqBody


    const newStory = new storyModel({
      user: existUser._id,
      content,
      storyType: storyType,
      visibility: visibility,
      background: background,
      media: []
    })

    await newStory.save({ session })

    if (media && media.length > 0) {
      const newMedia = {
        user: existUser._id,
        targetId: newStory._id,
        targetType: 'story',
        url: media[0].url,
        hlsUrl: media[0].hlsUrl,
        mimeType: media[0].mimeType,
        size: media[0].size,
        type: media[0].type,
        metadata: media[0].metadata,
        storage: media[0].storage
      }

      const savedMedia = await mediaModel.insertOne(newMedia, { session })

      newStory.media = savedMedia?._id
    }

    await newStory.save({ session })

    await newStory.populate([
      {
        path: 'user',
        select: 'username profilePicture'
      }, {
        path: 'media'
      }
    ])

    await session.commitTransaction()
    session.endSession()

    return newStory

  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

const getStories = async (userId) => {
  try {
    const existUser = await userModel.findById({ _id: userId })
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    const stories = await storyModel.find({ visibility: 'public', isActive: true }).populate([
      {
        path: 'user',
        select: 'username profilePicture'
      }, {
        path: 'media'
      }
    ])

    return stories
  } catch (error) {
    throw error
  }
}

export const storyService = {
  createNew,
  getStories
}