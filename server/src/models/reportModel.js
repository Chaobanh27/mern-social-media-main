import mongoose from 'mongoose'

const { Schema } = mongoose

const reportSchema = new Schema({
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  targetId: Schema.Types.ObjectId,
  targetType: String,
  reason: String,
  status: {
    type: String,
    default: 'pending'
  }
}, { collection: 'reports', timestamps: true })

const reportModel = mongoose.model('Report', reportSchema)

export default reportModel
