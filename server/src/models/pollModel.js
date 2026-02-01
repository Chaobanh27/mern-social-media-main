import mongoose from 'mongoose'

const { Schema } = mongoose

const pollSchema = new Schema({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    unique: true
  },
  multipleChoice: Boolean,
  expiresAt: Date
}, { collection: 'polls', timestamps: true })

const pollModel = mongoose.model('Poll', pollSchema)

export default pollModel
