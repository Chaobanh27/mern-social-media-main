import mongoose from 'mongoose'

const { Schema } = mongoose

const messageSchema = new Schema({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    index: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'emoji', 'image', 'video', 'file', 'audio']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { collection: 'messages', timestamps: true })

// messageSchema.index({ conversation: 1, createdAt: -1 })
// messageSchema.index({ content: 'text' })

const messageModel = mongoose.model('Message', messageSchema)

export default messageModel
