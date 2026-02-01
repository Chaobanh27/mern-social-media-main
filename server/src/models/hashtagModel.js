import mongoose from 'mongoose'

const { Schema } = mongoose

const hashtagSchema = new Schema(
  {
    name: {
      type: String,
      unique: true
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    usageCount: {
      type: Number,
      default: 0
    }
  },
  { collection: 'hashtags', timestamps: true }
)

// hashtagSchema.index({ name: 'text' })

const hashtagModel = mongoose.model('Hashtag', hashtagSchema)
export default hashtagModel
