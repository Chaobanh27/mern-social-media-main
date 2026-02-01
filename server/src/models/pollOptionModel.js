import mongoose from 'mongoose'

const { Schema } = mongoose

const pollOptionSchema = new Schema({
  poll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true,
    index: true
  },

  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  votesCount: {
    type: Number,
    default: 0
  }
}, {
  collection: 'poll_options',
  timestamps: true
})

// pollOptionSchema.index({ pollId: 1 })


const pollOptionModel = mongoose.model('Poll_Option', pollOptionSchema)

export default pollOptionModel
