import mongoose from 'mongoose'

const { Schema } = mongoose

const connectionSchema = new Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', index: true
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    type: {
      type: String,
      enum: ['follow', 'friend'],
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted'],
      index: true }
  },
  { collection: 'connections', timestamps: true }
)

// connectionSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true })

const connectionModel = mongoose.model('Connection', connectionSchema)
export default connectionModel
