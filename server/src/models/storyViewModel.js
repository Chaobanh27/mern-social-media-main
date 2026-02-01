import mongoose from 'mongoose'

const { Schema } = mongoose

const storyViewSchema = new Schema({
  story: {
    type: Schema.Types.ObjectId,
    ref: 'Story',
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'story_views', timestamps: {
  createdAt: true,
  updatedAt: false
} })

// storyViewSchema.index({ story: 1, user: 1 }, { unique: true })

const storyViewModel = mongoose.model('Story_View', storyViewSchema)

export default storyViewModel
