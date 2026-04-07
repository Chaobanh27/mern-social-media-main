import { useForm, useWatch } from 'react-hook-form'
import { Image, ImagePlay, Send, Smile, X } from 'lucide-react'
import { useChatStore } from '~/zustand/useChatStore'
import { useNavigate } from 'react-router-dom'
import { useSendMessage } from '~/hooks/TanstackQuery'
import { useEffect, useRef, useState } from 'react'
import EmojiPicker from 'emoji-picker-react'
import { useThemeStore } from '~/zustand/useThemeStore'
import SearchExperience from '../ui/Giphy'
import TypingIndicator from '../ui/TypingIndicator'
import { useSocketStore } from '~/zustand/useSocketStore'
import GifPreview from '../ui/GifPreview'
import { useMutation } from '@tanstack/react-query'
import { signUploadAPI } from '~/apis'
import toast from 'react-hot-toast'
import { fileSchema } from '~/utils/validators'
import authorizedAxiosInstance from '~/utils/authorizedAxios'
import TransferProgressBar from '../ui/TransferProgressBarr'

const ChatInput = ({ receiverId }) => {
  const [showEmoji, setShowEmoji] = useState(false)
  const [showGif, setShowGif] = useState(false)
  const [uploading, setUploading] = useState(false)


  const uploadBarRef = useRef(null)
  const uploadImageRef = useRef(null)
  const uploadVideoRef = useRef(null)
  const fileInputRef = useRef(null)

  const socket = useSocketStore(s => s.getSocket())
  const { selectedConversation, setSelectedConversation } = useChatStore()
  const { currentTheme } = useThemeStore()

  const isTemp = selectedConversation?.isTemp
  const navigate = useNavigate()
  const isTypingRef = useRef(false)
  const typingTimeOutRef = useRef(null)
  const { register, handleSubmit, getValues, setValue, reset, control } = useForm({
    defaultValues: {
      message: '',
      files: [],
      gif: null
    }
  })

  const files = useWatch({ control, name: 'files' }) || []
  const gif = useWatch({ control, name: 'gif' })

  const sendMessage = useSendMessage(selectedConversation?._id)

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

  const uploadTracker = useRef({ totalSize: 0, loadedMap: {} })

  const initUploadProgress = (targetFiles) => {
    uploadTracker.current.totalSize = targetFiles.reduce((sum, f) => sum + f?.file?.size, 0)
    targetFiles.forEach(f => {uploadTracker.current.loadedMap[f._id] = 0 })
  }

  const updateGlobalProgress = () => {
    const rawTotalLoaded = Object.values(uploadTracker.current.loadedMap).reduce((a, b) => a + b, 0)
    const safeLoaded = Math.min(rawTotalLoaded, uploadTracker.current.totalSize)
    const percent = Math.round((safeLoaded / uploadTracker.current.totalSize) * 100)

    uploadBarRef.current?.updateProgress({
      safeLoaded,
      totalSize: uploadTracker.current.totalSize,
      percent
    })
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


    const response = await authorizedAxiosInstance.post(signed.uploadUrl, formData, {
      withCredentials: false,
      onUploadProgress: e => {
        if (!e.total) return
        uploadTracker.current.loadedMap[fileId] = e.loaded
        updateGlobalProgress()
      },
      signal: uploadImageRef.current.signal
    })
    return response.data
  }

  const uploadVideoAPI = async (file, signed, fileId) => {
    const CHUNK_SIZE = 6 * 1024 * 1024
    let start = 0
    let uploaded = 0
    const uploadId = crypto.randomUUID()
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

      const response = await authorizedAxiosInstance.post(signed.uploadUrl, formData, {
        withCredentials: false,
        headers: {
          'X-Unique-Upload-Id': uploadId,
          'Content-Range': `bytes ${start}-${end}/${file.size}`
        },
        onUploadProgress: e => {
          uploadTracker.current.loadedMap[fileId] = Math.min(uploaded + e.loaded, file.size)
          updateGlobalProgress()
        },
        signal: uploadVideoRef.current.signal
      })
      uploaded += chunk.size
      start = end + 1
      if (start >= file.size) return response.data
    }
  }

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (!selectedFiles.length) return

    if (files.length + selectedFiles.length > 10) {
      toast.error('You can only upload a maximum of 10 media files per message.')
      return
    }

    let validFiles = []

    selectedFiles.forEach(f => {
      const result = fileSchema.safeParse(f)
      if (!result.success) {
        toast.error(result?.error?.issues[0].message)
        return
      }
      validFiles.push(f)
    })

    const newFiles = validFiles.map(f => ({
      file: f,
      _id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(f)
    }))

    setValue('files', [...files, ...newFiles])
    setValue('gif', null)
    e.target.value = ''
  }

  const handleRemoveFile = (id) => {
    const target = files.find(f => f._id === id)
    if (target?.previewUrl) {
      URL.revokeObjectURL(target.previewUrl)
    }
    setValue('files', files.filter(f => f._id !== id))
  }

  const emojiPickerTheme = () => {
    if (currentTheme == 'light') return 'light'
    else if (currentTheme == 'dark') return 'dark'
    else return 'auto'
  }

  const handleEmoji = (e) => {
    const message = getValues('message')
    setValue('message', message + e.emoji, {
      shouldValidate: true,
      shouldDirty: true
    })
  }

  const handleSelectGif = (e) => {
    const gif = {
      id: e.id,
      title: e.title,
      type: e.type,
      url: e.url,
      webp: e.images.fixed_height.webp,
      still: e.images.fixed_height_still.url,
      width: e.images.fixed_height.width,
      height: e.images.fixed_height.height
    }
    setValue('file', null)
    setValue('gif', gif)
    setShowGif(false)
  }

  const handleRemoveGif = () => {
    setValue('gif', null)
  }

  const onSubmit = async (data) => {
    if (!data.message.trim() && files.length === 0 && !gif) return

    try {
      setUploading(true)
      let uploadedAssets = []
      let messageType

      if (files.length > 0) {
        const { signedFiles } = await signUploadMutation.mutateAsync(files)

        const signedMap = Object.fromEntries(signedFiles.map(s => [s.originalName, s]))
        initUploadProgress(files)

        uploadedAssets = await Promise.all(files.map(f => {
          const signed = signedMap[f.file.name]
          return f.file.type.startsWith('video')
            ? uploadVideoAPI(f.file, signed, f._id)
            : uploadImageAPI(f.file, signed, f._id)
        }))

        const mediaType = uploadedAssets.map(asset => {
          return asset.resource_type
        })

        if (mediaType.includes('image') && mediaType.includes('video')) {
          messageType = 'mixed'
        }
        else if ( mediaType.includes('video')) {
          messageType = 'video'
        } else if ( mediaType.includes('image')) {
          messageType = 'image'
        } else {
          messageType = 'mixed'
        }
      }

      if (gif) messageType = 'gif'

      if (files.length === 0 && !gif) messageType = 'text'

      const payload = {
        message: data.message,
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
        })),
        gif: gif,
        messageType: messageType,
        receiverId: isTemp ? receiverId : selectedConversation.receiverId,
        conversationId: isTemp ? null : selectedConversation._id,
        conversationType: selectedConversation.type === 'group' ? 'group' : 'private',
        socketId: socket.id
      }

      sendMessage.mutate(payload, {
        onSuccess: (res) => {
          toast.success('success')
          if (isTemp && res) {
            navigate(`/conversation/${res.conversationId}`, { replace: true })
            setSelectedConversation({ ...selectedConversation, _id: res.conversationId, isTemp: false })
          }
          files.forEach(f => URL.revokeObjectURL(f.previewUrl))
          reset()
          setShowEmoji(false)
        }
      })
    } catch (error) {
      console.log(error);
      toast.error('Failed to send message')
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
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
    <div className="flex flex-col w-full bg-bg relative">
      <TypingIndicator control={control} isTypingRef={isTypingRef} typingTimeOutRef={typingTimeOutRef} />

      <div className="absolute bottom-full left-0 w-full p-2 space-y-2 bg-bg/80 backdrop-blur-sm">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map(f => (
              <div key={f._id} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                {f.file.type.startsWith('video') ? (
                  <video src={f.previewUrl} className="w-full h-full object-cover" />
                ) : (
                  <img src={f.previewUrl} className="w-full h-full object-cover" />
                )}
                <button onClick={() => handleRemoveFile(f._id)} className="absolute top-0 right-0 bg-black/50 text-white p-1 rounded-bl-lg">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        {gif !== null &&
            <div className='absolute bottom-full'>
              <GifPreview gif={gif} onRemove={handleRemoveGif} />
            </div> }

        {showGif ?
          <div className='absolute bottom-full w-2xs'>
            <SearchExperience onSelect = {handleSelectGif} />
          </div>
          : null}

        {showEmoji && (
          <div className='messenger-emoji-container absolute bottom-full'>
            <EmojiPicker
              onEmojiClick={handleEmoji}
              emojiStyle = {'native'}
              theme={emojiPickerTheme()}
              height={300}
              width={350}
              emojiSize={22}
              previewConfig={{
                showPreview: false
              }}
            />
          </div>
        )}

      </div>

      {/* <div className='relative flex items-center gap-2'>
        {showEmoji && (
          <div className='messenger-emoji-container absolute bottom-full mb-3'>
            <EmojiPicker
              onEmojiClick={handleEmoji}
              emojiStyle = {'native'}
              theme={emojiPickerTheme()}
              height={300}
              width={350}
              emojiSize={22}
              previewConfig={{
                showPreview: false
              }}
            />
          </div>
        )}

        {file && (
          <div className="p-2 flex justify-start absolute bottom-full w-2xs">
            <div className="relative max-w-50 overflow-hidden shadow-sm">
              {file.file.type.startsWith('video') ? (
                <video src={file.previewUrl} className="w-full h-full object-cover" />
              ) : (
                <img src={file.previewUrl} className="w-full h-full object-cover" />
              )}
              <button onClick={clearPreview} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1">
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {gif !== null &&
            <div className='absolute bottom-full'>
              <GifPreview gif={gif} onRemove={handleRemoveGif} />
            </div> }

        {showGif ?
          <div className='absolute bottom-full w-2xs'>
            <SearchExperience onSelect = {handleSelectGif} />
          </div>
          : null}

      </div> */}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-3 flex items-center gap-2 h-14"
      >
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          type="button" className="text-gray-500 hover:text-accent-hover transition-colors">
          <Smile size={22} />
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-500 hover:text-accent-hover transition-colors"
        >
          <Image size={22} />
        </button>

        <button
          onClick={() => setShowGif(!showGif)}
          type="button"
          className="text-gray-500 hover:text-accent-hover transition-colors">
          <ImagePlay size={22} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFilesChange}
          accept="image/*,video/*"
          className="hidden"
        />

        <input
          {...register('message')}
          disabled={uploading}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border rounded-full outline-none"
        />

        <button
          type="submit"
          disabled={uploading}
          className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors shadow-md disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>

      {uploading && (
        <TransferProgressBar
          ref={uploadBarRef}
          cancelUpload={() => {
            uploadImageRef.current?.abort()
            uploadVideoRef.current?.abort(); setUploading(false)
          }}
        />
      )}
    </div>
  )
}

export default ChatInput