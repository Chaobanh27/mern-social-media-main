import mongoose from 'mongoose'

const { Schema } = mongoose

const pollVoteSchema = new Schema({
  poll: {
    type: Schema.Types.ObjectId,
    ref: 'Poll',
    index: true
  },
  option: {
    type: Schema.Types.ObjectId,
    ref: 'PollOption'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { collection: 'poll_votes',
  timestamps: {
    createdAt: true,
    updatedAt: false
  } })

// pollVoteSchema.index({ poll: 1, user: 1 }, { unique: true })

const pollVoteModel = mongoose.model('Poll_Vote', pollVoteSchema)

export default pollVoteModel
