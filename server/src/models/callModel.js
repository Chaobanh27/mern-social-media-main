import mongoose from 'mongoose'

const { Schema } = mongoose

const callSchema = new Schema({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  callType: {
    type: String,
    enum: ['audio', 'video']
  },
  startedAt: Date,
  endedAt: Date
}, { collection: 'calls', timestamps: true })

const callModel = mongoose.model('Call', callSchema)

export default callModel