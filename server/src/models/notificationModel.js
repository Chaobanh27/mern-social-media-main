import mongoose from 'mongoose'

const { Schema } = mongoose

const notificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true
  },

  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  type: {
    type: String,
    enum: [
      'comment_post',
      'reply_comment',
      'reaction_post',
      'reaction_comment'
    ],
    required: true
  },

  targetId: Schema.Types.ObjectId,
  isRead: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, { collection: 'notifications', timestamps: true })

// notificationSchema.index({ user: 1, isRead: 1 })

const notificationModel = mongoose.model('Notification', notificationSchema)

export default notificationModel