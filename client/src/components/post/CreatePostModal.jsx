import { useForm } from 'react-hook-form'
import { X, Image, Smile } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import RHFSelect from '~/components/form/RHFSelect'
import { useMutation } from '@tanstack/react-query'
import { signUploadAPI } from '~/apis'
import toast from 'react-hot-toast'
import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { fileSchema, postShema } from '~/utils/validators'
import Modal from '../ui/Modal'
import { zodResolver } from '@hookform/resolvers/zod'
import UploadProgressBar from '../ui/UploadProgressBarr'
import SubmitButton from './SubmitButton'
import CharacterCounter from '../ui/CharacterCounter'
import { useCreatePost } from '~/hooks/TanstackQuery/usePostQueries'
import EmojiPickerModal from '../ui/EmojiPickerModal'
import TextAreaAutoSize from 'react-textarea-autosize'

const BG_COLORS = [
  '',
  'bg-gradient-to-r from-pink-500 to-yellow-500',
  'bg-gradient-to-r from-blue-500 to-cyan-500',
  'bg-gradient-to-r from-purple-500 to-pink-500'
]

const VISIBILITY_OPTIONS = [
  { label: 'Public', value: 'public' },
  { label: 'Friends', value: 'friends' },
  { label: 'Private', value: 'private' }
]


const CreatePostModal = ({ showModal, onClose }) => {
  const [bg, setBg] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)

  const progressRef = useRef(null)
  const percentRef = useRef(null)
  const sizeRef = useRef(null)
  const totalRef = useRef(null)

  const { register, control, watch, handleSubmit, reset, setValue, getValues, formState : { errors } } = useForm({
    resolver: zodResolver(postShema),
    defaultValues: {
      content: '',
      visibility: 'public',
      files: []
    }
  })

  const createPostMutation = useCreatePost()

  const files = watch('files') || []

  const uploadTracker = {
    totalSize: 0,
    loadedMap: {} // key: fileId -> loaded bytes
  }

  const signUploadMutation = useMutation({
    mutationFn: (files) =>
      signUploadAPI({
        files: files.map(f => ({
          name: f?.file?.name,
          type: f?.file?.type,
          size: f?.file?.size
        }))
      })
  })

  const uploadImageRef = useRef(null)
  const uploadVideoRef = useRef(null)

  const initUploadProgress = (files) => {
    uploadTracker.totalSize = files.reduce(
      (sum, f) => sum + f?.file?.size,
      0
    )

    files.forEach(f => {
      uploadTracker.loadedMap[f._id] = 0
    })
  }

  const updateGlobalProgress = () => {
    const rawTotalLoaded = Object.values(uploadTracker.loadedMap)
      .reduce((a, b) => a + b, 0)

    const safeLoaded = Math.min(
      rawTotalLoaded,
      uploadTracker.totalSize
    )

    const percent = Math.round(
      (safeLoaded / uploadTracker.totalSize) * 100
    )
    // console.log(totalLoaded);
    // console.log(uploadTracker.totalSize);
    // console.log(percent);

    if (progressRef.current) {
      progressRef.current.style.width = percent + '%'
      percentRef.current.textContent = percent + '%'
      sizeRef.current.textContent = Math.round(safeLoaded / 1048576) > 1 ? Math.round(safeLoaded / 1048576) + 'MB' : Math.round(safeLoaded / 1024) + 'KB'
      totalRef.current.textContent = Math.round(uploadTracker.totalSize / 1048576) > 1 ? Math.round(uploadTracker.totalSize / 1048576) + 'MB' : Math.round(uploadTracker.totalSize / 1024) + 'KB'
    }
  }

  const uploadImageAPI = async (file, signed, fileId) => {
    uploadImageRef.current = new AbortController()

    const formData = new FormData()

    formData.append('file', file)
    formData.append('api_key', signed.apiKey)
    formData.append('timestamp', signed.timestamp)
    formData.append('signature', signed.signature)
    formData.append('folder', signed.folder)
    formData.append('colors', signed.colors)
    formData.append('public_id', signed.publicId)
    // formData.append('transformation', 'c_limit,w_1920')

    const response = await authorizedAxiosInstance.post(
      signed.uploadUrl,
      formData,
      //
      {
        withCredentials: false,
        onUploadProgress: (event) => {
          if (!event.total) return
          uploadTracker.loadedMap[fileId] = event.loaded
          updateGlobalProgress()
        },
        signal: uploadImageRef.current.signal
      }
    )

    return response.data
  }

  const uploadVideoAPI = async (file, signed, fileId) => {
    const CHUNK_SIZE = 6 * 1024 * 1024
    const uploadId = crypto.randomUUID()
    let start = 0
    let uploaded = 0
    uploadVideoRef.current = new AbortController()

    while (start < file.size) {
      const end = Math.min(start + CHUNK_SIZE - 1, file.size - 1)
      const chunk = file.slice(start, end + 1)

      const formData = new FormData()
      formData.append('file', chunk)
      formData.append('api_key', signed.apiKey)
      formData.append('timestamp', signed.timestamp)
      formData.append('signature', signed.signature)
      formData.append('folder', signed.folder)
      formData.append('public_id', signed.publicId)
      formData.append('resource_type', 'video')

      const response = await authorizedAxiosInstance.post(
        signed.uploadUrl,
        formData,
        {
          withCredentials: false,
          headers: {
            'X-Unique-Upload-Id': uploadId,
            'Content-Range': `bytes ${start}-${end}/${file.size}`
          },
          onUploadProgress: (event) => {
            if (!event.loaded) return
            const currentLoaded = uploaded + event.loaded
            uploadTracker.loadedMap[fileId] = Math.min(
              currentLoaded,
              file.size
            )
            updateGlobalProgress()
          },
          signal: uploadVideoRef.current.signal
        }
      )

      // console.log(`[CHUNK] ${start}-${end}/${file.size}`)

      uploaded += chunk.size
      start = end + 1
      if (start >= file?.size) {
        return response.data
      }
    }
    return
  }

  const handleFiles = (e) => {
    const SelectedFile = Array.from(e.target.files)
    if (!SelectedFile.length) return

    let validFiles = []

    SelectedFile.forEach(file => {
      const result = fileSchema.safeParse(file)
      if (!result.success) {
        toast.error(result?.error?.issues[0].message)
        return
      }
      validFiles.push(file)
    })

    const newFiles = validFiles.map(f => ({
      file: f,
      _id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(f)
    }))

    const updatedFiles = [...newFiles, ...files]

    setValue('files', updatedFiles, {
      shouldValidate: true,
      shouldDirty: true
    })

    setBg(null)
    e.target.value = ''
  }

  const handleRemove = (id) => {
    const target = files.find(f => f._id === id)

    if (target?.previewUrl) {
      URL.revokeObjectURL(target.previewUrl)
    }

    const filtered = files.filter(f => f._id !== id)

    setValue('files', filtered, { shouldValidate: true })
  }

  const onSubmit = async (data) => {
    try {
      if (files.length > 0) {
        files.forEach( file => {
          fileSchema.parse(file?.file)
        })

        setUploading(true)

        const { signedFiles } = await signUploadMutation.mutateAsync(files)

        const signedMap = Object.fromEntries(
          signedFiles.map(item => [item.originalName, item])
        )

        initUploadProgress(files)

        const uploadedAssets = await Promise.all(
          files.map(f => {
            const signed = signedMap[f?.file?.name]

            if (!signed) {
              throw new Error(`Missing signed data for ${f?.file?.name}`)
            }

            if (f?.file?.type.startsWith('video')) {
              return uploadVideoAPI(f?.file, signed, f._id)
            }

            return uploadImageAPI(f?.file, signed, f._id)
          })
        )

        const mediaType = uploadedAssets.map(asset => {
          return asset.resource_type
        })

        let postType

        if (mediaType.includes('image') && mediaType.includes('video')) {
          postType = 'mixed'
        }
        else if ( mediaType.includes('video')) {
          postType = 'video'
        } else if ( mediaType.includes('image')) {
          postType = 'image'
        } else {
          postType = 'mixed'
        }

        // Gửi data tạo post (media đã upload xong)
        const postPayload = {
          content: data.content,
          background: bg,
          postType: postType,
          visibility: data.visibility,
          media: uploadedAssets.map(asset => ({
            type: asset.resource_type,
            url: asset.secure_url,
            hlsUrl: asset?.playback_url || null,
            mimeType:`${asset.resource_type}/${asset.format}`,
            size: asset.bytes,
            metadata: {
              width: asset.width,
              height: asset.height,
              aspectRatio: (asset.width / asset.height).toFixed(2),
              duration: asset?.duration || null,
              thumbnailUrl: asset.secure_url.replace(/\.[^/.]+$/, '.jpg'),
              technical:{
                codec: asset?.video?.codec || null,
                bitRate: asset?.video?.bit_rate || null
              },
              dominantColor: asset?.colors && asset?.colors.length > 0 ? asset?.colors[0][0] : null
            },
            storage: {
              provider: 'cloudinary',
              publicId: asset.public_id,
              version: asset.version
            }
          }))
        }

        const res = await createPostMutation.mutateAsync(postPayload)
        console.log('result: ', res)

        files.forEach(f => {
          if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
        })
        reset()
        setBg(null)
        onClose()
        return
      }


      // Gửi data tạo post
      const postPayload = {
        content: data.content,
        background: bg,
        postType: 'text',
        visibility: data.visibility,
        media: []
      }

      const res = await createPostMutation.mutateAsync(postPayload)
      console.log(res)

      files.forEach(f => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
      })
      reset()
      setBg(null)
      onClose()
    } catch (error) {
      console.log(error)
    }
    finally {
      setUploading(false)
    }

  }

  const cancelUpload = () => {
    if (uploadImageRef.current) {
      uploadImageRef.current.abort()
    } else {
      uploadVideoRef.current.abort()
    }
    setUploading(false)

  }


  useEffect(() => {
    //khi đóng modal thì component sẽ unmout vì thế nên revoke thêm ở đây
    return () => {
      const currentFiles = getValues('files')
      if (currentFiles) {
        currentFiles.forEach(f => {
          if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
        })
      }
    }
  }, [getValues])


  return (
    <Modal
      showModal={showModal}
      onClose={onClose}
      className="w-full max-w-lg shadow-xl"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-sm:h-screen bg-bg-alt shadow-xl"
      >
        <div className="border-b border-b-border px-4 py-3 text-center font-semibold bg-bg-alt">
          CREATE POST
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-2"
          >
            <X size={18} className='text-primary-text' />
          </button>
        </div>

        <div className="p-4 space-y-4 bg-bg-alt">
          <div className='max-h-90 sm:max-h-130 overflow-y-auto '>
            <div
              className={`rounded-lg p-3 ${
                bg ? `${bg} text-primary-text mb-3` : 'bg-bg-alt'
              }`}
            >

              <TextAreaAutoSize
                {...register('content')}
                name='content'
                type="text"
                minRows={3}
                maxRows={10}
                placeholder="What is happening ?"
                className={clsx('w-full resize-none bg-transparent text-lg outline-none', bg && 'placeholder-white/70')}
              />
              <CharacterCounter control={control}/>
              {errors.content && <span className='text-red-500'>{errors.content?.message}</span>}

            </div>

            {
              showEmoji && <EmojiPickerModal control={control} setValue={setValue}/>
            }

            {files.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-35 ">
                {files.map((f) => (
                  <div key={f._id} className="rounded-lg">
                    {f?.file?.type.startsWith('video') ? (
                      <div className='relative border border-accent'>
                        <video
                          src={f?.previewUrl}
                          className="h-32 w-full object-cover"
                          controls
                        />
                        <button onClick={() => handleRemove(f?._id)} className='w-6 h-6 text-sm absolute top-2 right-3 rounded-full bg-bg'>X</button>
                      </div>

                    ) : (
                      <div className='relative'>
                        <img
                          src={f?.previewUrl}
                          className="h-32 w-full object-cover"
                        />
                        <button onClick={() => handleRemove(f?._id)} className='w-6 h-6 text-sm absolute top-2 right-3 rounded-full bg-bg'>X</button>
                      </div>

                    )}
                  </div>
                ))}
              </div>
            )}

            {files.length === 0 && (
              <div className="flex gap-2">
                {BG_COLORS.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setBg(color)}
                    className={`h-8 w-8 rounded-full border-2 ${color} ${
                      bg === color ? '' : ''
                    }`}
                  />
                ))}
              </div>
            )}


          </div>


          <div className='space-y-4'>
            <div className="flex items-center justify-between rounded-lg border border-gray-600 p-3">
              <span className="text-sm font-medium">Add to your post</span>
              <div className='flex items-center justify-evenly '>

                <label className="cursor-pointer rounded-full p-2 hover:bg-bg">
                  <Image className="text-green-500" />
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    hidden
                    onChange={handleFiles}
                  />
                </label>
                <button type='button' onClick={() => setShowEmoji(!showEmoji) } className='hover:bg-bg cursor-pointer rounded-full p-2'>
                  <Smile/>
                </button>
              </div>

              {errors.files && <span className='text-text-error'>{errors.files?.message}</span>}
            </div>

            <RHFSelect
              name="visibility"
              placeholder='who can see?'
              control={control}
              rules={{ required: 'visibility is required' }}
              options={VISIBILITY_OPTIONS}
              className='text-gray-700'
            />

            <SubmitButton createPostMutation={createPostMutation} control={control} files={files} filesCount={files.length} uploading={uploading} />
          </div>


        </div>

      </form>

      { uploading && <UploadProgressBar
        progressRef={progressRef}
        percentRef={percentRef}
        sizeRef={sizeRef}
        totalRef={totalRef}
        cancelUpload={cancelUpload}
      /> }
    </Modal>

  )
}

export default CreatePostModal
