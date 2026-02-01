import mongoose from 'mongoose'

const { Schema } = mongoose

const postHashtagSchema = new Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true
    },

    hashtag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hashtag',
      required: true,
      index: true
    }
  },
  {
    collection: 'post_hashtags',
    timestamps: true
  }
)

const postHashtagModel = mongoose.model('Post_Hashtag', postHashtagSchema)

export default postHashtagModel
