import mongoose from 'mongoose'

const { Schema } = mongoose

const mentionSchema = new Schema({
  sourceId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  sourceType: {
    type: String,
    enum: ['post', 'comment', 'story']
  },
  mentionedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }
}, { collection: 'mentions', timestamps: true }
)

// mentionSchema.index({ mentionedUser: 1 })

const mentionModel = mongoose.model('Mention', mentionSchema)

export default mentionModel
