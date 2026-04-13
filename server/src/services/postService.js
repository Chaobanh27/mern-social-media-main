import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import bookmarkModel from '~/models/bookmarkModel'
import mediaModel from '~/models/mediaModel'
import postModel from '~/models/postModel'
import reactionModel from '~/models/reactionModel'
import userModel from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { extractHashtags } from '~/utils/genericHelper'
import slugify from 'slugify'
import hashtagModel from '~/models/hashtagModel'
import postHashtagModel from '~/models/postHashtagModel'


const createNew = async (userId, reqBody) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const existUser = await userModel.findById({ _id: userId })
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    const { content, background, postType, visibility, media, originalPostId } = reqBody

    const newPost = new postModel({
      user: existUser._id,
      content,
      postType: postType,
      visibility: visibility,
      background: background,
      media: [],
      originalPost: originalPostId || null
    })

    if (originalPostId) {
      const originalPost = await postModel.findById({ _id: originalPostId }).session(session)
      if (!originalPost) throw new ApiError(StatusCodes.NOT_FOUND, 'Original post not found!')

      await postModel.findByIdAndUpdate(
        { _id: originalPostId },
        { $inc: { 'stats.shares' : 1 } },
        { session }
      )
    }

    await newPost.save({ session })

    const hashtagsInContent = extractHashtags(content)

    if (hashtagsInContent.length > 0) {
      let hashtagIds = []
      for ( let tagName of hashtagsInContent) {
        // Tạo slug (ví dụ: "Lập Trình" -> "lap-trinh")
        const tagSlug = slugify(tagName, { lower: true, locale: 'vi' })

        // Tìm trong database xem hashtag này đã tồn tại chưa
        // Nếu có rồi thì tăng usageCount lên 1, nếu chưa có (upsert) thì tạo mới
        const hashtag = await hashtagModel.findOneAndUpdate(
          { slug: tagSlug },
          {
            $set: { name: tagName },
            $inc: { usageCount: 1 }
          },
          {
            upsert: true, // Không có thì tạo mới
            new: true,
            session
          }
        )

        hashtagIds.push(hashtag._id)
      }

      //Sau khi đã có danh sách ID tạo các bản ghi cho bảng trung gian
      let postHashtags = []

      for ( let hId of hashtagIds) {
        postHashtags.push({
          post: newPost._id,
          hashtag: hId
        })
      }

      //Lưu tất cả vào bảng Post Hashtag
      if (postHashtags.length > 0) {
        await postHashtagModel.insertMany(postHashtags, { session })
      }

    }

    if (!originalPostId && media && media.length > 0) {
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
    }


    await newPost.populate([
      {
        path: 'user',
        select: 'username profilePicture'
      }, {
        path: 'media'
      }, {
        path: 'originalPost',
        populate: {
          path: 'user',
          select: 'username profilePicture'
        }
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

const getPostsByUser = async (currentUserId, userId, reqQuery) => {
  try {
    const existUser = await userModel.findById({ _id: userId })

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')

    const limit = Number(reqQuery.limit) || 5
    const cursor = reqQuery.cursor

    let pinnedPost = null

    const query = {
      user: userId,
      visibility: 'public',
      isActive: true
    }

    if (!cursor) {
      pinnedPost = await postModel.findOne({
        ...query,
        isPinned: true
      })
        .populate([
          {
            path: 'user',
            select: 'username profilePicture'
          }, {
            path: 'media'
          }, {
            path: 'originalPost',
            populate: [
              {
                path: 'user',
                select: 'username profilePicture'
              },
              { path: 'media' }
            ]

          }
        ])
        .lean()
    }

    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursor) }
    }

    const posts = await postModel
      .find({
        ...query,
        isPinned: false
      })
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate([
        {
          path: 'user',
          select: 'username profilePicture'
        }, {
          path: 'media'
        }, {
          path: 'originalPost',
          populate: [
            {
              path: 'user',
              select: 'username profilePicture'
            },
            { path: 'media' }
          ]

        }
      ])
      .lean()

    const postIds = posts.map(p => p._id)
    let myReactions = []
    if (currentUserId) {
      myReactions = await reactionModel.find({
        user: currentUserId,
        targetType: 'post',
        targetId: { $in: [...postIds] }
      })
        .lean()
    }
    const allPosts = pinnedPost ? [pinnedPost, ...posts] : [...posts]
    const reactionMap = new Map(myReactions.map(r => [r.targetId.toString(), r.reactionType]))

    const hasMore = posts.length > limit

    if (hasMore) posts.pop()

    const result = allPosts.map(m => ({
      ...m,
      myReaction: reactionMap.get(m._id.toString()) || null
    }))

    return {
      data: result,
      nextCursor: hasMore ? posts[posts.length - 1]._id : null,
      hasMore
    }

  } catch (error) {
    throw error
  }
}

const getFeed = async (userId, reqQuery) => {
  try {
    const existUser = await userModel.findById({ _id: userId })
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    const limit = Number(reqQuery.limit) || 5
    const cursor = reqQuery.cursor

    const query = {
      visibility: 'public',
      isActive: true
    }

    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursor) }
    }

    const posts = await postModel
      .find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate([
        {
          path: 'user',
          select: 'username profilePicture'
        }, {
          path: 'media'
        }, {
          path: 'originalPost',
          populate: [
            {
              path: 'user',
              select: 'username profilePicture'
            },
            { path: 'media' }
          ]

        }
      ])
      .lean()

    const postIds = posts.map(p => p._id)
    let myReactions = []
    if (userId) {
      myReactions = await reactionModel.find({
        user: userId,
        targetType: 'post',
        targetId: { $in: [...postIds] }
      })
        .lean()
    }

    const reactionMap = new Map(myReactions.map(r => [r.targetId.toString(), r.reactionType]))

    const hasMore = posts.length > limit

    if (hasMore) posts.pop()

    const result = posts.map(m => ({
      ...m,
      myReaction: reactionMap.get(m._id.toString()) || null
    }))

    return {
      data: result,
      nextCursor: hasMore ? posts[posts.length - 1]._id : null,
      hasMore
    }
  } catch (error) {
    throw error
  }
}

const pinPost = async (userId, postId) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    await postModel.updateMany(
      {
        user: userId,
        isPinned: true
      },
      {
        isPinned: false
      },
      { session }
    )

    const pinnedPost = await postModel.findOneAndUpdate(
      {
        _id: postId,
        user: userId
      },
      {
        isPinned: true
      },
      {
        new: true,
        session
      }
    )

    await session.commitTransaction()
    session.endSession()

    return pinnedPost
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

const toggleBookmark = async (userId, postId) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const existUser = await userModel.findById({ _id: userId })

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

    const existPost = await postModel.findById({ _id: postId })
    if (!existPost) throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found!')

    const existBookmark = await bookmarkModel.findOne({ user: userId, post: postId })

    if (!existBookmark) {
      await bookmarkModel.create({
        user: userId,
        post: postId
      }, { session })

      await session.commitTransaction()
      session.endSession()
      return { isBookmarked: true }

    }

    await bookmarkModel.findByIdAndUpdate(
      { _id: existBookmark._id },
      { isActive: false },
      { session }
    )

    await session.commitTransaction()
    session.endSession()
    return { isBookmarked: false }

  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

const getBookmarks = async (userId, reqQuery) => {
  try {
    const existUser = await userModel.findById({ _id: userId })

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')

    const limit = Number(reqQuery.limit) || 10
    const cursor = reqQuery.cursor

    const query = {
      user: userId
    }

    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursor) }
    }

    const bookmarks = await bookmarkModel
      .find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate({
        path: 'post',
        match: { isActive: true },
        populate: [{
          path: 'user',
          select: 'username profilePicture'
        },
        { path: 'media' },
        {
          path: 'originalPost',
          populate: [
            {
              path: 'user',
              select: 'username profilePicture'
            },
            { path: 'media' }
          ] }
        ]
      })
      .lean()

    const hasMore = bookmarks.length > limit

    if (hasMore) bookmarks.pop()

    return {
      data: bookmarks,
      nextCursor: hasMore ? bookmarks[bookmarks.length - 1]._id : null,
      hasMore
    }
  } catch (error) {
    throw error
  }
}

export const postService = {
  createNew,
  getPost,
  getPostsByUser,
  getFeed,
  pinPost,
  toggleBookmark,
  getBookmarks
}