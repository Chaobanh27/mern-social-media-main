import mongoose from 'mongoose'

const { Schema } = mongoose

const reactionSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true
    },
    targetType: {
      type: String, enum: ['post', 'comment', 'story'],
      index: true
    },
    reactionType: {
      type: String,
      enum: ['like', 'love', 'haha', 'sad', 'angry']
    }
  },
  { collection: 'reactions', timestamps: true }
)

// reactionSchema.index(
//   { userId: 1, targetId: 1, targetType: 1 },
//   { unique: true }
// )

const reactionModel = mongoose.model('Reaction', reactionSchema)

export default reactionModel
