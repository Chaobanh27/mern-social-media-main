import mongoose from 'mongoose'

const { Schema } = mongoose

const commentSchema = new Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },

    content: {
      type:String,
      required: true
    },

    reactionSummary: { type: Map, of: Number, default: {} },

    isActive: {
      type: Boolean, default: true
    }
  },
  { collection: 'comments', timestamps: true }
)

// commentSchema.index({ postId: 1, createdAt: -1 })

const commentModel = mongoose.model('Comment', commentSchema)

export default commentModel
