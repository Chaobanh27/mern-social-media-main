import mongoose from 'mongoose'

const { Schema } = mongoose


const postSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true
    },
    content: {
      type: String,
      trim: true,
      maxLength: [5000, 'Content must not be more than 5000 characters']
    },

    postType: {
      type:String,
      enum: ['mixed', 'text', 'video', 'image', 'poll'],
      required: true
    },

    visibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public',
      index: true
    },

    background: {
      type: String
    },

    media: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    }],

    originalPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      index: true
    },

    isPinned: {
      type: Boolean,
      default: false,
      index: true
    },

    savedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    }],

    reactionSummary: {
      type: Map,
      of: {
        type: Number,
        min: 0
      },
      default: {}
    },

    stats: {
      views: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      reactions: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      hotScore: { type: Number, default: 0, index: -1 }
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { collection: 'posts', timestamps: true }
)

postSchema.index({ user: 1, isActive: 1, createdAt: -1 })
postSchema.index({ isActive: 1, visibility: 1, createdAt: -1 })


const postModel = mongoose.model('Post', postSchema)

export default postModel
