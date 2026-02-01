import mongoose from 'mongoose'

const { Schema } = mongoose

const blockSchema = new Schema({
  blocker: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  blocked: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { collection:'blocks', timestamps: true })

// blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true })

const blockModel = mongoose.model('Block', blockSchema)

export default blockModel
