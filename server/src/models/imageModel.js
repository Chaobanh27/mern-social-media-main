import mongoose from 'mongoose'
import validator from 'validator'

const { Schema } = mongoose

const imageSchema = new Schema(
  {
    media: {
      type: Schema.Types.ObjectId,
      ref: 'Media',
      required: true,
      unique: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
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
    },

    searchText: { type: String }
  },
  {
    collection: 'images',
    timestamps: true
  }
)

const imageModel = mongoose.model('Image', imageSchema)

export default imageModel
