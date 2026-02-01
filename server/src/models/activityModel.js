import mongoose from 'mongoose'

const { Schema } = mongoose

const activitySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  action: String,
  targetType: String,
  targetId: Schema.Types.ObjectId
}, { collection: 'activities', timestamps: true })

// activitySchema.index({ user: 1, createdAt: -1 })

const activityModel = mongoose.model('Activity', activitySchema)

export default activityModel
