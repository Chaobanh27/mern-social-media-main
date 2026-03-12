import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import commentModel from '~/models/commentModel'
import giphyModel from '~/models/giphyModel'
import mediaModel from '~/models/mediaModel'
// import likeModel from '~/models/likeModel'
// import notificationModel from '~/models/notificationModel'
import postModel from '~/models/postModel'
import reactionModel from '~/models/reactionModel'
import userModel from '~/models/userModel'
// import { getIO } from '~/sockets'
import ApiError from '~/utils/ApiError'
import { toggleActiveById } from '~/utils/genericHelper'


const createNew = async (userId, reqBody) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const { postId, content, media, gif } = reqBody
    const existUser = await userModel.findById({ _id: userId })
    const existPost = await postModel.findById({ _id: postId })

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
    if (!existPost) throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found!')
    if (!existPost.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Post is not active!')

    const newComment = await commentModel({
      post: postId,
      user: userId,
      content: content
    })

    await newComment.save({ session })

    if (media) {
      const newMedia = await mediaModel.create([
        {
          user: existUser?._id,
          targetId: newComment?._id,
          targetType: 'comment',
          url: media?.url,
          mimeType: media?.mimeType,
          size: media?.size,
          type: media?.type,
          metadata: media?.metadata,
          storage: media?.storage
        }
      ], { session })

      newComment.media = newMedia[0]._id
    }

    if (gif) {
      // Tìm xem GIF đã có trong kho chưa, nếu chưa thì tạo mới
      const giphyDoc = await giphyModel.findOneAndUpdate(
        { giphyId: gif.id },
        {
          giphyId: gif.id,
          title: gif.title,
          type: gif.type,
          url: gif.url,
          webp: gif.webp,
          mp4: gif.mp4,
          still: gif.still,
          duration: gif.duration,
          width: gif.width,
          height: gif.height
        },
        { upsert: true, new: true, session }
      )
      newComment.giphy = giphyDoc._id
    }

    await newComment.save({ session })


    // if (existPost?.author?.toString() !== userId) {
    //   //tạo notification và lưu vào DB
    //   await notificationModel.create({
    //     userId: existPost?.author,
    //     senderId: userId,
    //     type: 'comment_post',
    //     postId: postId
    //   })
    //   //xử lý real time thông báo đến chủ bài post
    //   getIO().to(existPost?.author?.toString()).emit('notification', {
    //     type: 'comment_post',
    //     postId: postId,
    //     senderId: existUser,
    //     message: 'has commented on your post',
    //     createdAt: Date.now()
    //   })
    // }


    await session.commitTransaction()
    session.endSession()

    await newComment.populate([
      {
        path: 'user',
        select: 'username profilePicture email'
      }, {
        path: 'media'
      }
    ])

    return newComment
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

const update = async (commentId, postId, userId, content) => {
  try {
    const existUser = await userModel.findById({ _id: userId })
    const existPost = await postModel.findById({ _id: postId })
    const existComment = await commentModel.findById({ _id: commentId })

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

    if (!existPost) throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found!')
    if (!existPost.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your post is not active!')

    if (!existComment) throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found!')
    if (!existComment.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your comment is not active!')

    if (existComment.user.toString() !== userId) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized !')

    const editedComment = await commentModel.findByIdAndUpdate(
      { _id: commentId },
      {
        content: content
      },
      { new: true }
    ).populate([
      {
        path: 'user',
        select: 'username profilePicture email'
      }, {
        path: 'media'
      }
    ])

    return editedComment

  } catch (error) {
    throw error
  }
}

const createReply = async (parentCommentId, replyContent, userId) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const existUser = await userModel.findById({ _id: userId })
    const existParentComment = await commentModel.findById({ _id: parentCommentId })

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
    if (!existParentComment) throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found!')
    if (!existParentComment.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Comment is not active!')

    const existPost = await postModel.findById({ _id: existParentComment.post })
    if (!existPost) throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found!')
    if (!existPost.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Post is not active!')

    const newReplyComment = await commentModel({
      post: existParentComment?.post,
      user: userId,
      content: replyContent,
      parentComment: parentCommentId
    })

    await newReplyComment.save({ session })

    // if (existParentComment?.userId?.toString() !== userId) {
    //   //tạo notification và lưu vào DB
    //   await notificationModel.create({
    //     userId: existPost?.author,
    //     senderId: userId,
    //     type: 'reply_comment',
    //     commentId: parentCommentId,
    //     postId: existParentComment.postId
    //   })

    //   //xử lý real time thông báo đến chủ bài post
    //   getIO().to(existParentComment?.userId?.toString()).emit('notification', {
    //     type: 'reply_comment',
    //     commentId: parentCommentId,
    //     postId: existParentComment.postId,
    //     senderId: existUser,
    //     message: 'has replied to your comment',
    //     createdAt: Date.now()
    //   })
    // }

    await session.commitTransaction()
    session.endSession()

    await newReplyComment.populate({
      path: 'user',
      select: 'username profilePicture email'
    })

    return newReplyComment

  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

const getCommentsByPost = async (postId, userId, reqQuery) => {
  const limit = Number(reqQuery.limit) || 5
  const cursor = reqQuery.cursor

  //Query lấy cmt cha
  const query = {
    post: postId,
    parentComment: null,
    isActive: true
  }

  //Kiểm tra biến cursor có tồn tại và có phải là objectId không
  if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
    //Chỉ lấy những bản ghi có _id nhỏ hơn ($lt - cũ hơn) giá trị của cursor
    query._id = { $lt: new mongoose.Types.ObjectId(cursor) }
  }

  //Tổng số cmt trong 1 bài post
  const totalCommentsByPost = await commentModel.countDocuments({ post: postId, isActive: true })

  //Lấy các cmt cha sắp xếp theo thứ tự giảm dần (mới đến cũ)
  const parentComments = await commentModel.find(query)
    .populate([
      {
        path: 'user',
        select: 'username profilePicture email'
      },
      {
        path: 'media'
      },
      {
        path: 'giphy'
      }
    ])
    .sort({ _id: -1 })
    /*
    Nếu bạn muốn hiển thị 10 bản ghi, bạn sẽ yêu cầu 11 bản ghi.
    Mục đích: Để kiểm tra xem còn dữ liệu ở trang sau hay không (hasNextPage).
    Nếu kết quả trả về đủ 11 bản ghi
    Nghĩa là còn trang tiếp theo. Bạn sẽ cắt bỏ bản ghi thứ 11 này trước khi gửi về client, nhưng dùng nó để đặt biến hasNextPage = true.
     */
    .limit(limit + 1)
    /*
    Chuyển kết quả từ Mongoose Document về Plain JavaScript Object.
    Điều này giúp truy vấn nhanh hơn đáng kể và tiết kiệm bộ nhớ
    vì không cần các tính năng thừa của Mongoose (như save, validate).
     */
    .lean()

  const parentIds = parentComments.map(c => c._id)

  const replies = await commentModel.find({
    parentComment: { $in: parentIds },
    isActive: true
  })
    .populate({
      path: 'user',
      select: 'username profilePicture email'
    })
    .lean()

  const replyIds = replies.map(r => r._id)

  //Tìm các bản ghi có userId trùng với id của bản thân và có targetId lất tất cả cmt cha và con
  let myReactions = []
  if (userId) {
    myReactions = await reactionModel.find({
      user: userId,
      targetType: 'comment',
      targetId: { $in: [...parentIds, ...replyIds] }
    })
      .lean()
  }

  const reactionMap = new Map(myReactions.map(r => [r.targetId.toString(), r.reactionType]))

  //Tạo obj với key sẽ là id cmt cha và value sẽ là mảng chứa cmt con của id cmt cha đó
  const replyMap = {}
  replies.forEach(r => {
    if (!replyMap[r.parentComment]) replyMap[r.parentComment] = []
    replyMap[r.parentComment].push(r)
  })

  //Kiểm tra nếu như mảng cmt cha nhiều hơn só cmt muốn trả về
  const hasMore = parentComments.length > limit

  //nếu đúng thì chứng ta dữ liệu vẫn còn nên lấy phần tử cuối ra
  if (hasMore) parentComments.pop()

  const result = parentComments.map(c => ({
    ...c,
    myReaction: reactionMap.get(c._id.toString()) || null,
    replies: replyMap[c._id]?.map(r => ({
      ...r,
      myReaction: reactionMap.get(r._id.toString()) || null
    })) || []
  }))

  return {
    data: result,
    /*
    Nếu còn dữ liệu phía sau thì lấy id của cmt cuối cùng trong danh sách hiện tại mà Client vừa nhận được.
    Giá trị này sẽ được dùng làm Con trỏ (Cursor) cho lần truy vấn tiếp theo
    */
    nextCursor: hasMore
      ? parentComments[parentComments.length - 1]._id
      : null,
    hasMore,
    totalCommentsByPost: totalCommentsByPost
  }
}

const toggleActive = async (userId, commentId) => {
  try {
    const existUser = await userModel.findOne({ _id: userId })
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

    const result = toggleActiveById(commentModel, commentId, 'comment')

    return result
  } catch (error) {
    throw error
  }
}

export const commentService = {
  createNew,
  update,
  createReply,
  getCommentsByPost,
  toggleActive
}