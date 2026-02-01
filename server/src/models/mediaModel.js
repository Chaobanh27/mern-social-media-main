import mongoose from 'mongoose'
import validator from 'validator'

const { Schema } = mongoose

const mediaSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    targetType: {
      type: String,
      required: true,
      enum: ['post', 'comment', 'message', 'story']
    },

    url: {
      type:String,
      required: true,
      validate: {
        validator: v => validator.isURL(v),
        message: 'Invalid media URL'
      }
    },

    type: {
      type: String,
      required: true,
      enum: {
        values: ['image', 'video', 'file', 'audio'],
        message: '{VALUE} is not supported'
      }
    },

    mimeType: {
      type: String,
      validate: {
        validator: v => !v || validator.isMimeType(v),
        message: 'Invalid MIME type'
      }
    },
    size: {
      type: Number,
      validate: {
        validator: v => !v || validator.isInt(v.toString(), { min: 1 }),
        message: 'File size must be greater than 0'
      }
    },

    storage: {
      provider: {
        type: String,
        required: true,
        enum: ['cloudinary', 's3', 'local']
      },
      publicId: {
        type: String,
        required: function () {
          return this.storage?.provider === 'coudinary'
        },
        validate: {
          validator: v => !v || validator.isLength(v, { min: 1, max: 255 }),
          message: 'Invalid publicId'
        }
      },
      bucket: {
        type: String,
        required: function() {
          return this.storage?.provider === 's3'
        },
        validate: {
          validator: v => !v || validator.isLength(v, { min: 3, max: 63 }),
          message: 'Invalid bucket name'
        }
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { collection: 'media', timestamps: true }
)

// mediaSchema.index({
//   targetType: 1,
//   targetId: 1,
//   isActive: 1,
//   createdAt: 1
// })

// mediaSchema.index({
//   user: 1,
//   isActive: 1,
//   createdAt: -1
// })

// mediaSchema.index({
//   type: 1,
//   encodingStatus: 1,
//   createdAt: 1
// })

// mediaSchema.index({
//   type: 1,
//   isActive: 1,
//   createdAt: -1
// })


const mediaModel = mongoose.model('Media', mediaSchema)

export default mediaModel
