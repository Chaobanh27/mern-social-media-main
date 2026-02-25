import express from 'express'
import { uploadController } from '~/controllers/uploadController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/sign').post(authMiddleware.isAuthorized, uploadController.signUpload)

export const signRoute = Router


// async (req, res) => {
//   try {
//     const { files } = req.body

//     if (!Array.isArray(files) || files.length === 0) {
//       return res.status(400).json({ message: 'Files required' })
//     }

//     const timestamp = Math.round(Date.now() / 1000)

//     const signedFiles = files.map(file => {
//       fileMetaSchema.parse(file)

//       const resourceType = file?.type.startsWith('video')
//         ? 'video'
//         : 'image'

//       const publicId = generatePublicId(file?.name)
//       const folder = generateFolder(file?.type)

//       //params phải xếp theo thứ tự alphabet nếu không sẽ lỗi Invalid signature - String to sign
//       const paramsToSign = {
//         folder,
//         public_id: publicId,
//         timestamp
//       }

//       const signature = cloudinaryV2.utils.api_sign_request(
//         paramsToSign,
//         env.CLOUDINARY_API_SECRET
//       )


//       return {
//         originalName: file.name,
//         resourceType,
//         publicId,
//         folder,
//         timestamp,
//         signature,
//         apiKey: env.CLOUDINARY_API_KEY,
//         uploadUrl:
//           resourceType === 'video'
//             ? `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/video/upload`
//             : `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`
//       }
//     })

//     res.json({ signedFiles })
//   } catch (err) {
//     console.error(err)
//     res.status(400).json({
//       message: 'Invalid upload request',
//       error: err.message
//     })
//   }
// }