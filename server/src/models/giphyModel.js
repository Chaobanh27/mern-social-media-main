import mongoose from 'mongoose'

const { Schema } = mongoose

const giphySchema = new Schema({
  giphyId: {
    type: String
  },
  title: { type: String },
  rendition: { type: String, default: 'fixed_height' },
  type: {
    type: String,
    enum: ['gif', 'clip', 'sticker'],
    default: 'gif'
  },
  url: { type: String },
  webp: { type: String },
  mp4: { type: String },
  still: { type: String },
  duration: { type: Number },
  width: { type: Number },
  height: { type: Number }

}, { collection: 'giphy', timestamps: true }
)

const giphyModel = mongoose.model('Giphy', giphySchema)

export default giphyModel