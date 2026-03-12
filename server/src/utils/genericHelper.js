import userModel from '~/models/userModel'
import crypto from 'crypto'
import dayjs from 'dayjs'
import ApiError from './ApiError'
import { StatusCodes } from 'http-status-codes'

export const generateUniqueUsername = async (base) => {
  let username = base
  let counter = 1
  const existUsername = await userModel.exists({ normalizedUsername: username })

  while (existUsername) {
    username = `${base}_${counter}`
    counter++
  }

  return username
}

export const generatePublicId = (originalName) => {
  const ext = originalName.split('.').pop()
  const hash = crypto.randomBytes(16).toString('hex')
  return `${hash}.${ext}`
}

export const generateFolder = (mime) => {
  const type = mime.startsWith('video') ? 'videos' : 'images'
  const date = dayjs().format('YYYY/MM')
  return `${type}/${date}`
}

export const toggleActiveById = async (model, id, name) => {
  const doc = await model.findById(id)
  if (!doc) throw new ApiError(StatusCodes.NOT_FOUND, `${name} not found!`)

  const newStatus = !doc.isActive

  // 1. Nếu là comment cha, cập nhật trạng thái cho TẤT CẢ các reply con của nó
  if (name === 'comment' && !doc.parentComment) {
    await model.updateMany(
      { parentComment: id },
      { $set: { isActive: newStatus } }
    )
  }

  // 2. Cập nhật trạng thái cho chính nó (dù là cha hay con)
  doc.isActive = newStatus
  await doc.save()

  return doc
}