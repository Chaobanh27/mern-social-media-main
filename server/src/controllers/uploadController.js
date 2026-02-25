import { StatusCodes } from 'http-status-codes'
import { uploadService } from '~/services/uploadService'

const signUpload = async (req, res, next) => {
  try {
    const { userId } = req.auth()
    const { files } = req.body

    const result = await uploadService.signUpload(userId, files)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const uploadController = {
  signUpload
}