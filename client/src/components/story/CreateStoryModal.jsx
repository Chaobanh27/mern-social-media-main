import { ArrowLeft, TextIcon, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import Modal from '../ui/Modal'
import { signUploadAPI } from '~/apis'
import { useMutation } from '@tanstack/react-query'
import { fileSchema } from '~/utils/validators'
import toast from 'react-hot-toast'
import { useCreateStory } from '~/hooks/TanstackQuery'
import authorizedAxiosInstance from '~/utils/authorizedAxios'
import UploadProgressBar from '../ui/TransferProgressBarr'
import SubmitButton from '../ui/SubmitButton'

const BG_COLORS = [
  '#4f46e5',
  '#7c3aed',
  '#db2777',
  '#e11d48',
  '#ca8a04',
  '#0d9488',
  '#000000'
]

const CreateStoryModal = ({ showModal, onClose }) => {

  const [mode, setMode] = useState('text')
  const [uploading, setUploading] = useState(false)

  const progressRef = useRef(null)
  const percentRef = useRef(null)
  const sizeRef = useRef(null)
  const totalRef = useRef(null)

  const { register, control, watch, reset, setValue, getValues, handleSubmit } = useForm({
    defaultValues: {
      content: '',
      background: BG_COLORS[0],
      visibility: 'public',
      file: null
    }
  })


  const createStoryMutation = useCreateStory()

  const selectedFile = watch('file') || null
  const selectedBg = watch('background') || BG_COLORS[0]

  const uploadTracker = {
    totalSize: 0,
    loadedMap: {}
  }

  const signUploadMutation = useMutation({
    mutationFn: (f) =>
      signUploadAPI({
        files: [{
          name: f?.file?.name,
          type: f?.file?.type,
          size: f?.file?.size
        }]
      })
  })

  const uploadImageRef = useRef(null)
  const uploadVideoRef = useRef(null)


  const updateGlobalProgress = () => {
    const rawTotalLoaded = Object.values(uploadTracker.loadedMap)[0] || 0

    const safeLoaded = Math.min(
      rawTotalLoaded,
      uploadTracker.totalSize
    )

    const percent = Math.round(
      (safeLoaded / uploadTracker.totalSize) * 100
    )

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
    const file = e.target.files[0]
    if (!file) return

    const result = fileSchema.safeParse(file)
    if (!result.success) {
      toast.error(result?.error?.issues[0].message)
      return
    }

    if (selectedFile?.previewUrl) {
      URL.revokeObjectURL(selectedFile.previewUrl)
    }

    const newFileObject = {
      file: file,
      _id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file)
    }

    setMode('media')
    setValue('file', newFileObject, { shouldValidate: true })
    setValue('background', selectedBg)
    e.target.value = ''
  }

  const handleRemove = () => {
    if (selectedFile?.previewUrl) {
      URL.revokeObjectURL(selectedFile.previewUrl)
    }
    setValue('file', null, { shouldValidate: true })
  }

  const cancelUpload = () => {
    if (uploadImageRef.current) {
      uploadImageRef.current.abort()
    } else {
      uploadVideoRef.current.abort()
    }
    setUploading(false)

  }

  const onSubmit = async (data) => {
    try {
      setUploading(true)
      let uploadedAsset = null

      if (data.file) {
        const { signedFiles } = await signUploadMutation.mutateAsync(data.file)
        const signed = signedFiles[0]

        uploadTracker.totalSize = data?.file?.file?.size
        uploadTracker.loadedMap[data?.file._id] = 0

        if (data?.file?.file?.type.startsWith('video')) {
          uploadedAsset = await uploadVideoAPI(data.file.file, signed, data.file._id)
        } else {
          uploadedAsset = await uploadImageAPI(data.file.file, signed, data.file._id)
        }
      }

      const storyPayload = {
        content: data.content,
        background: selectedBg,
        storyType: uploadedAsset ? (uploadedAsset.resource_type === 'video' ? 'video' : 'image') : 'text',
        visibility: data.visibility,
        media: uploadedAsset ? [
          {
            type: uploadedAsset.resource_type,
            url: uploadedAsset.secure_url,
            hlsUrl: uploadedAsset?.playback_url || null,
            mimeType:`${uploadedAsset.resource_type}/${uploadedAsset.format}`,
            size: uploadedAsset.bytes,
            metadata: {
              width: uploadedAsset.width,
              height: uploadedAsset.height,
              aspectRatio: (uploadedAsset.width / uploadedAsset.height).toFixed(2),
              duration: uploadedAsset?.duration || null,
              thumbnailUrl: uploadedAsset.secure_url.replace(/\.[^/.]+$/, '.jpg'),
              technical:{
                codec: uploadedAsset?.video?.codec || null,
                bitRate: uploadedAsset?.video?.bit_rate || null
              },
              dominantColor: uploadedAsset?.colors && uploadedAsset?.colors.length > 0 ? uploadedAsset?.colors[0][0] : null
            },
            storage: {
              provider: 'cloudinary',
              publicId: uploadedAsset.public_id,
              version: uploadedAsset.version
            }
          }
        ] : []

      }

      await createStoryMutation.mutateAsync(storyPayload)

      handleRemove()
      reset()
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    //khi đóng modal thì component sẽ unmout vì thế nên revoke thêm ở đây
    return () => {
      const currentFile = getValues('file')
      if (currentFile) {
        URL.revokeObjectURL(currentFile?.previewUrl)
      }
    }
  }, [getValues])

  return (
    <Modal
      showModal={showModal}
      onClose={onClose}
      className="w-full max-w-lg px-5 md:px-0 "
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-sm:h-screen text-primary-text">

        {/* HEADER */}
        <div className="text-center mb-4 flex items-center justify-between">
          <button
            type='button'
            onClick={onClose}
            className="p-2 cursor-pointer"
          >
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">Create Story</h2>
          <span className="w-10"></span>
        </div>

        {/* PREVIEW */}
        <div
          className="rounded-lg overflow-hidden h-96 flex items-center justify-center"
          style={{ backgroundColor: selectedBg }}
        >
          {mode === 'text' && (
            <textarea
              {...register('content')}
              placeholder="What's on your mind?"
              className="w-full h-full p-6 text-lg resize-none focus:outline-none"
            />
          )}

          {mode === 'media' && selectedFile && (
            <div className='relative h-full w-full flex items-center justify-center'>
              {selectedFile?.file?.type.startsWith('image') ? (
                <img
                  src={selectedFile?.previewUrl}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <video
                  src={selectedFile?.previewUrl}
                  className="max-h-full max-w-full object-contain"
                  controls
                />
              )}

              <button
                type='button'
                onClick={() => {
                  setMode('text')
                  setValue(BG_COLORS[0])
                  setValue('file', null)
                }}
                className='w-6 h-6 text-sm absolute top-2 right-3 rounded-full bg-bg hover:bg-gray-200 z-10'
              >
      X
              </button>
            </div>
          )}
        </div>

        {/* BACKGROUND COLORS */}
        <div className="flex mt-4 gap-2">
          {BG_COLORS.map((color) => (
            <button
              type='button'
              key={color}
              className={`w-6 h-6 rounded-full ring cursor-pointer ${
                selectedBg === color ? 'ring-white' : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setValue('background', color)}
            />
          ))}
        </div>

        {/* MODE SELECT */}
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => {
              setMode('text')
              setValue('file', null)
            }}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded ${
              mode === 'text' ? 'bg-white text-black' : 'bg-zinc-800'
            }`}
          >
            <TextIcon size={18} /> Text
          </button>

          <label
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === 'media' ? 'bg-white text-black' : 'bg-zinc-800'
            }`}
          >
            <Upload size={18} /> Photo / Video
            <input
              type="file"
              accept="image/*,video/*"
              hidden
              onChange={handleFiles}
            />
          </label>
        </div>

        {/* SUBMIT */}
        <SubmitButton mutation={createStoryMutation} control={control} file={selectedFile} />


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

export default CreateStoryModal
