import userModel from '~/models/userModel'
import crypto from 'crypto'
import dayjs from 'dayjs'

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

// export const generatePublicId = (originalName) => {
//   const ext = originalName.split('.').pop()
//   const hash = crypto.randomBytes(16).toString('hex')

//   return `${hash}.${ext}`
// }

// export const generateFolder = (resourceType) => {
//   const date = dayjs().format('YYYY/MM')

//   return `${resourceType}s/${date}`
// }