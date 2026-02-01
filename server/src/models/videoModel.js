import mongoose from 'mongoose'
import validator from 'validator'

const { Schema } = mongoose

const videoSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  media: {
    type: Schema.Types.ObjectId,
    ref: 'Media',
    required: true,
    unique: true,
    index: true
  },

  duration: {
    type: Number,
    validate: {
      validator: v => !v || validator.isFloat(v.toString(), { min: 0 }),
      message: 'Duration must be >= 0'
    }
  },
  height: {
    type: Number,
    validate: {
      validator: v => !v || validator.isInt(v.toString(), { min: 1 }),
      message: 'Height must be > 0'
    }
  },
  width: {
    type: Number,
    validate: {
      validator: v => !v || validator.isInt(v.toString(), { min: 1 }),
      message: 'Height must be > 0'
    }
  },
  aspectRatio: {
    type: String,
    index: true
  },
  fps: {
    type: Number,
    validate: {
      validator: v => !v || validator.isFloat(v.toString(), { min: 1 }),
      message: 'FPS must be > 0'
    }
  },
  bitrate: {
    type: Number
  },
  codec: {
    type: String
  },
  hlsUrl: {
    type:String
  },
  thumbnailUrl: {
    type: String,
    validate: {
      validator: v => !v || validator.isURL(v),
      message: 'Invalid thumbnail URL'
    }
  },

  encodingStatus: {
    type: String,
    enum: ['pending', 'processing', 'done', 'failed'],
    default: 'pending'
  },


  status: {
    type: String,
    enum: ['active', 'processing', 'blocked', 'deleted'],
    default: 'processing',
    index: true
  },

  stats: {
    viewCount: { type: Number, default: 0, min: 0 },
    reactionCount: { type: Number, default: 0, min: 0 },
    commentCount: { type: Number, default: 0, min: 0 },
    saveCount: { type: Number, default: 0, min: 0 },
    shareCount: { type: Number, default: 0 }
  },

  score: {
    type: Number,
    default: 0
  }
}, { collection: 'videos', timestamps: true })

// videoSchema.index({ status: 1, visibility: 1, score: -1, createdAt: -1 })

const videoModel = mongoose.model('Video', videoSchema)

export default videoModel
