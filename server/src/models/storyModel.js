import mongoose from 'mongoose'

const { Schema } = mongoose

const storySchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    content: String,
    viewsCount: {
      type: Number,
      default: 0 },
    backgroundColor: String,
    expiresAt: {
      type: Date,
      index: true }
  },
  { collection: 'stories', timestamps: true }
)

// storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const storyModel = mongoose.model('Story', storySchema)

export default storyModel
