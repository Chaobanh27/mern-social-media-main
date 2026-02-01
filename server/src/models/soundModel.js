import mongoose from 'mongoose'

const { Schema } = mongoose

const SoundSchema = new Schema({
  media: {
    type: Schema.Types.ObjectId,
    ref: 'Media'
  },
  url: String,
  title: String,
  duration: Number,
  usageCount: { type: Number, default: 0 }
}, { collection: 'sounds', timestamps: true })

const soundModel = mongoose.model('Sound', SoundSchema)

export default soundModel