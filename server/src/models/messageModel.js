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
    type: String
  },
  messageType: {
    type: String,
    enum: ['text', 'gif', 'image', 'video', 'file', 'audio', 'system', 'mixed']
  },
  media: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'Media'
    }],
    validate: {
      validator: function(v) {
        return v.length <= 10
      },
      message: 'A message cannot have more than 10 media files.'
    }
  },
  giphy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Giphy',
    default: null
  },
  reactionSummary: {
    type: Map,
    of: Number,
    default: {}
  },
  // Dùng cho tin nhắn hệ thống (vd: "A đã thêm B vào nhóm")
  systemAction: {
    type: String, // 'add_member', 'leave_group', 'change_name'...
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { collection: 'messages', timestamps: true })

messageSchema.index({ conversation: 1, createdAt: -1 })
messageSchema.index({ conversation: 1, content: 'text' })

const messageModel = mongoose.model('Message', messageSchema)

export default messageModel
