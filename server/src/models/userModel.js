import mongoose from 'mongoose'
import validator from 'validator'

const { Schema } = mongoose

const userSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
      unique: true
    },

    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      unique: true,
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },

    normalizedUsername: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      validate: {
        validator: validator.isEmail,
        message: 'Invalid email format'
      }
    },

    profilePicture: {
      type: String,
      default: '',
      validate: {
        validator: (v) =>
          !v || validator.isURL(v, { protocols: ['http', 'https'], require_protocol: true }),
        message: 'Invalid URL format'
      }
    },

    coverPhoto: {
      type: String,
      default: '',
      validate: {
        validator: (v) =>
          !v || validator.isURL(v, { protocols: ['http', 'https'], require_protocol: true }),
        message: 'Invalid URL format'
      }
    },

    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500
    },

    location: {
      type: String,
      trim: true
    },

    phone: {
      type: String,
      validate: {
        validator: (v) => !v || validator.isMobilePhone(v),
        message: (props) => `${props.v} is not a valid phone number`
      }
    },

    followersCount: {
      type: Number,
      default: 0,
      min: 0
    },

    followingCount: {
      type: Number,
      default: 0,
      min: 0
    },

    searchText: {
      type: String,
      index: true
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    collection: 'users',
    timestamps: true
  }
)

// userSchema.index({ username: 'text', fullName: 'text', searchText: 'text' })


const userModel = mongoose.model('User', userSchema)

export default userModel