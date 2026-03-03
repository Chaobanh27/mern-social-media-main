import mongoose from 'mongoose'

const { Schema } = mongoose

const storySchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    content: {
      type: String,
      trim: true,
      maxLength: [5000, 'Content must not be more than 5000 characters']
    },
    background: {
      type: String
    },
    media: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    }],
    storyType: {
      type:String,
      enum: ['text', 'video', 'image'],
      required: true
    },
    visibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public',
      index: true
    },
    viewsCount: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { collection: 'stories', timestamps: true }
)

// storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const storyModel = mongoose.model('Story', storySchema)

export default storyModel
