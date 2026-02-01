import mongoose from 'mongoose'

const { Schema } = mongoose

const notificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: String,
  targetId: Schema.Types.ObjectId,
  isRead: {
    type: Boolean,
    default: false
  }
}, { collection: 'notifications', timestamps: true })

// notificationSchema.index({ user: 1, isRead: 1 })

const notificationModel = mongoose.model('Notification', notificationSchema)

export default notificationModel