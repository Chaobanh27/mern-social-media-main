import mongoose from 'mongoose'

const { Schema } = mongoose

const conversationSchema = new Schema({
  type: {
    type: String,
    enum: ['private', 'group']
  }
}, { collection: 'conversations', timestamps: true })

const conversationModel = mongoose.model('Conversation', conversationSchema)

export default conversationModel
