import mongoose from 'mongoose'

const { Schema } = mongoose

const userSettingSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },

    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },

    allowMessages: {
      type: String,
      enum: ['everyone', 'friends', 'no_one'],
      default: 'everyone'
    },

    allowMentions: {
      type: Boolean,
      default: true
    },

    notifications: {
      like: { type: Boolean, default: true },
      comment: { type: Boolean, default: true },
      follow: { type: Boolean, default: true },
      message: { type: Boolean, default: true },
      mention: { type: Boolean, default: true }
    },

    mutedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  }, { collection: 'user_settings', timestamps: true }
)


const UserSetting = mongoose.model('User_Setting', userSettingSchema)

export default UserSetting
