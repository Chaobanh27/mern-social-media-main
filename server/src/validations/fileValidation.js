import { z } from 'zod'

const imageMetaSchema = z.object({
  name: z.string(),
  type: z.string().refine(v =>
    ['image/jpeg', 'image/png', 'image/webp'].includes(v)
  ),
  size: z.number().max(5 * 1024 * 1024)
})

const videoMetaSchema = z.object({
  name: z.string(),
  type: z.string().refine(v =>
    ['video/mp4', 'video/webm'].includes(v)
  ),
  size: z.number().max(500 * 1024 * 1024)
})

export const fileMetaSchema = z.union([
  imageMetaSchema,
  videoMetaSchema
])

