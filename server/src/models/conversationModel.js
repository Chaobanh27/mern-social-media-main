import mongoose from 'mongoose'
import validator from 'validator'

const { Schema } = mongoose

const conversationSchema = new Schema({
  type: {
    type: String,
    enum: ['private', 'group']
  },
  name : {
    type: String
  },
  groupPicture: {
    type: String,
    default: '',
    validate: {
      validator: (v) =>
        !v || validator.isURL(v, { protocols: ['http', 'https'], require_protocol: true }),
      message: 'Invalid URL format'
    }
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  }
}, { collection: 'conversations', timestamps: true })

conversationSchema.index({ updatedAt: -1 })


const conversationModel = mongoose.model('Conversation', conversationSchema)

export default conversationModel
