import mongoose from 'mongoose'

const { Schema } = mongoose


const postSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', index: true
    },
    content: {
      type: String,
      trim: true,
      minLength: [1, 'length must be at least 1'],
      maxLength: [5000, 'length must not be more than 5000']
    },

    postType: {
      type:String,
      enum: ['mixed', 'video', 'image', 'poll'],
      reuqired: true
    },

    visibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public',
      index: true
    },

    originalPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },

    reactionSummary: {
      type: Map,
      of: {
        type: Number,
        min: 0
      },
      default: {}
    },

    stats: {
      reactionCount: { type: Number, default: 0 },
      commentCount: { type: Number, default: 0 },
      viewCount: { type: Number, default: 0 },
      shareCount: { type: Number, default: 0 },
      saveCount: { type: Number, default: 0 }
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { collection: 'posts', timestamps: true }
)

// postSchema.index({ isActive: 1, createdAt: -1 })
// postSchema.index({ user: 1, isActive: 1, createdAt: -1 })
// postSchema.index({ visibility: 1, isActive: 1, createdAt: -1 })


const postModel = mongoose.model('Post', postSchema)

export default postModel
