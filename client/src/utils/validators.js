import { z } from 'zod'

export const fileSchema = z
  .file()
  .optional()
  .superRefine((file, ctx) => {
    if (file.type.startsWith('image/')) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Ảnh phải là jpeg, png, jpg hoặc webp'
        })
      }

      if (file.size > 5 * 1024 * 1024) {
        ctx.addIssue({
          code: 'custom',
          message: 'Ảnh tối đa 5MB'
        })
      }

      return
    }

    if (file.type.startsWith('video/')) {
      if (!['video/mp4', 'video/webm'].includes(file.type)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Video must be mp4 or webm'
        })
      }

      if (file.size > 100 * 1024 * 1024) {
        ctx.addIssue({
          code: 'custom',
          message: 'Video maximum 100MB'
        })
      }

      return
    }

    ctx.addIssue({
      code: 'custom',
      message: 'only allow upload image or video'
    })
  })

export const postShema = z.object({
  content: z.string().trim(),

  visibility: z.string().min(1, 'visibility is required'),

  files: z.array(
    z.object({
      file: z.any(),
      _id: z.string(),
      previewUrl: z.string()
    })
  ).default([])
})
  .refine((data) => {
    if (data.files.length === 0) {
      return data.content.length > 0
    }
    return true
  }, {
    message: 'post content can not be empty if there is no image or video',
    path: ['content']
  })
