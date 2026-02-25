/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import userModel from '~/models/userModel'
import cloudinaryV2 from '~/providers/CloudinaryProvider'
import ApiError from '~/utils/ApiError'
import { generateFolder, generatePublicId } from '~/utils/genericHelper'
import { fileMetaSchema } from '~/validations/fileValidation'

const signUpload = async (userId, files) => {
  try {
    const existUser = await userModel.findOne({ clerkId: userId })
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    if (!Array.isArray(files) || files.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Files not found!')
    }

    const timestamp = Math.round(Date.now() / 1000)

    const signedFiles = files.map(file => {
      fileMetaSchema.parse(file)

      const resourceType = file?.type.startsWith('video')
        ? 'video'
        : 'image'

      const publicId = generatePublicId(file?.name)
      const folder = generateFolder(file?.type)
      const colors = resourceType === 'image' ? true : null

      //params phải xếp theo thứ tự alphabet nếu không sẽ lỗi Invalid signature - String to sign
      const paramsToSign = {
        colors,
        folder,
        public_id: publicId,
        timestamp
      }

      const signature = cloudinaryV2.utils.api_sign_request(
        paramsToSign,
        env.CLOUDINARY_API_SECRET
      )


      return {
        originalName: file.name,
        resourceType,
        publicId,
        folder,
        colors,
        timestamp,
        signature,
        apiKey: env.CLOUDINARY_API_KEY,
        uploadUrl:
          resourceType === 'video'
            ? `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/video/upload`
            : `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`
      }
    })

    return { signedFiles }
  } catch (error) {
    throw error
  }
}

export const uploadService = {
  signUpload
}