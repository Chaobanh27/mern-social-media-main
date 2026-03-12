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
      required: function() { return !this.media && !this.giphy }
    },

    media: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    },

    giphy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Giphy'
    },

    reactionSummary: {
      type: Map,
      of: Number,
      default: {}
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { collection: 'comments', timestamps: true }
)

commentSchema.index({ postId: 1, createdAt: -1 })

const commentModel = mongoose.model('Comment', commentSchema)

export default commentModel
