import mongoose from 'mongoose'

const { Schema } = mongoose

const bookmarkSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post', required: true
  }
},
{ collection: 'bookmarks', timestamps: true }
)

// bookmarkSchema.index({ user: 1, post: 1 }, { unique: true })
// bookmarkSchema.index({ user: 1, createdAt: -1 })

const bookmarkModel = mongoose.model('Bookmark', bookmarkSchema)

export default bookmarkModel


