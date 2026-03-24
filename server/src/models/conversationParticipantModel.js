import mongoose from 'mongoose'

const { Schema } = mongoose

const conversationParticipantSchema = new Schema({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  lastReadAt: {
    type: Date,
    default: Date.now
  },
  role: String,
  joinedAt: { type: Date, default: Date.now }
}, { collection: 'conversation_participants', timestamps: true })

conversationParticipantSchema.index({ conversation: 1, user: 1 }, { unique: true })

const conversationParticipantModel = mongoose.model('Conversation_Participant', conversationParticipantSchema)

export default conversationParticipantModel


