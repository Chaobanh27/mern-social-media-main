/* eslint-disable no-console */
import mongoose from 'mongoose'
import { env } from '~/config/environment'

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI)
  } catch (err) {
    console.error('MongoDB connection error:', err)
    //kết thúc chương trình với số nguyên khác 0 chứng tỏ là chương trình bị lỗi
    process.exit(1)
  }
}
