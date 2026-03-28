import { useEffect, useRef, useState } from 'react'
import CommentInput from './CommentInput'
import { useForm } from 'react-hook-form'
import CommentItem from './CommentItem'
import { useCreateComment, useCreateReply, useGetCommentsByPost, useUpdateComment } from '~/hooks/TanstackQuery'
import { fileSchema } from '~/utils/validators'
import toast from 'react-hot-toast'
import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { useMutation } from '@tanstack/react-query'
import { signUploadAPI } from '~/apis'
import TransferProgressBar from '../ui/TransferProgressBarr'
import { useUserStore } from '~/zustand/userStore'
import { useThemeStore } from '~/zustand/useThemeStore'
import SearchExperience from '../ui/Giphy'
import GifPreview from '../ui/GifPreview'

const CommentList = ({ postId }) => {
  const [showEmoji, setShowEmoji] = useState(false)
  const [showGif, setShowGif] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { register, handleSubmit, setValue, getValues, reset, formState: { errors } } = useForm({
    defaultValues: {
      content: '',
      file: null,
      gif: null
    }
  })

  const createCommentMutation = useCreateComment(postId)
  const createReplyMutation = useCreateReply(postId)
  const updateCommentMutation = useUpdateComment(postId)
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

  const currentUser = useUserStore(state => state.user)
  const currentTheme = useThemeStore(state => state.theme)

  const limit = 5
  const file = getValues('file') || null
  const gif = getValues('gif') || null
  const uploadBarRef = useRef(null)
  const uploadImageRef = useRef(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useGetCommentsByPost(postId, limit, null)

  const comments = data?.pages?.flatMap(p => p.data) || []

  const totalComments = data?.pages[0]?.totalCommentsByPost || 0


  const handleFile = (e) => {
    const SelectedFile = e.target.files[0]
    if (!SelectedFile) return

    const result = fileSchema.safeParse(SelectedFile)
    if (!result.success) {
      toast.error(result?.error?.issues[0].message)
      return
    }

    const newFile = {
      file: SelectedFile,
      _id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(SelectedFile)
    }


    setValue('file', newFile, {
      shouldValidate: true,
      shouldDirty: true
    })

    e.target.value = ''
  }

  const uploadTracker = useRef({
    totalSize: 0,
    loadedMap: {}
  })

  const initUploadProgress = (file) => {
    uploadTracker.current.totalSize = file?.file?.size
    uploadTracker.current.loadedMap[file?._id] = 0
  }

  const updateGlobalProgress = (fileId = null) => {
    let rawTotalLoaded
    if (fileId) {
      rawTotalLoaded = uploadTracker.current.loadedMap[fileId] || 0
    } else {
      rawTotalLoaded = Object.values(uploadTracker.current.loadedMap).reduce((a, b) => a + b, 0)
    }

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

    const response = await authorizedAxiosInstance.post(
      signed.uploadUrl,
      formData,
      {
        withCredentials: false,
        onUploadProgress: (event) => {
          if (!event.total) return
          uploadTracker.current.loadedMap[fileId] = event.loaded
          updateGlobalProgress(fileId)
        },
        signal: uploadImageRef.current.signal
      }
    )

    return response.data
  }

  const handleEdit = async (commentId, data) => {
    const payload = {
      ...data,
      postId: postId
    }
    await updateCommentMutation.mutateAsync({ commentId, data: payload })
  }

  const handleEmoji = (e) => {
    const content = getValues('content')
    setValue('content', content + e.emoji, {
      shouldValidate: true,
      shouldDirty: true
    })
  }

  const emojiPickerTheme = () => {
    if (currentTheme == 'light') return 'light'
    else if (currentTheme == 'dark') return 'dark'
    else return 'auto'
  }

  const handleRemove = () => {
    const target = getValues('file')

    if (target?.previewUrl) {
      URL.revokeObjectURL(target.previewUrl)
    }

    setValue('file', null, { shouldValidate: true })
  }

  const cancelUpload = () => {
    if (uploadImageRef.current) {
      uploadImageRef.current.abort()
    }
    setUploading(false)
  }

  const addComment = async (data) => {
    try {
      if (file) {
        fileSchema.parse(file?.file)

        setUploading(true)

        const { signedFiles } = await signUploadMutation.mutateAsync([file])

        const signedMap = Object.fromEntries(
          signedFiles.map(item => [item.originalName, item])
        )

        initUploadProgress(file)
        const signed = signedMap[file?.file?.name]
        const uploadAsset = await uploadImageAPI(file?.file, signed, file?._id)

        const commentPayload = {
          content: data?.content,
          media: {
            type: uploadAsset.resource_type,
            url: uploadAsset.secure_url,
            hlsUrl: uploadAsset?.playback_url || null,
            mimeType:`${uploadAsset.resource_type}/${uploadAsset.format}`,
            size: uploadAsset.bytes,
            metadata: {
              width: uploadAsset.width,
              height: uploadAsset.height,
              aspectRatio: (uploadAsset.width / uploadAsset.height).toFixed(2),
              duration: uploadAsset?.duration || null,
              thumbnailUrl: uploadAsset.secure_url.replace(/\.[^/.]+$/, '.jpg'),
              technical:{
                codec: uploadAsset?.video?.codec || null,
                bitRate: uploadAsset?.video?.bit_rate || null
              },
              dominantColor: uploadAsset?.colors && uploadAsset?.colors.length > 0 ? uploadAsset?.colors[0][0] : null
            },
            storage: {
              provider: 'cloudinary',
              publicId: uploadAsset.public_id,
              version: uploadAsset.version
            }
          }
        }

        await createCommentMutation.mutateAsync({ ...commentPayload, postId: postId }, {
          onSuccess: () => {
            reset()
            handleRemove()
          }
        })
        return
      }

      if (gif) {
        await createCommentMutation.mutateAsync({ ...data, gif: gif, postId: postId }, {
          onSuccess: () => {
            reset()
          }
        })
        return
      }
      await createCommentMutation.mutateAsync({ ...data, postId: postId }, {
        onSuccess: () => {
          reset()
        }
      })

    } catch (error) {
      console.log(error)
    } finally {
      setUploading(false)
    }
  }

  const addReply = async (parentCommentId, replyContent) => {
    await createReplyMutation.mutateAsync({ parentCommentId, replyContent })
  }

  const handleRemoveGif = () => {
    setValue('gif', null)
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
    setValue('gif', gif)
    setShowGif(false)
  }

  useEffect(() => {
    //khi chuyển trang thì component sẽ unmout vì thế nên revoke thêm ở đây
    return () => {
      const currentFile = getValues('file')
      if (currentFile) {
        URL.revokeObjectURL(currentFile?.previewUrl)
      }
    }
  }, [getValues])


  return (
    <section className="mt-12">
      {
        currentUser ? <CommentInput
          register={register}
          handleSubmit={handleSubmit}
          onSubmit = {addComment}
          onEmoji = {handleEmoji}
          setShowEmoji={setShowEmoji}
          showEmoji={showEmoji}
          setShowGif={setShowGif}
          showGif = {showGif}
          theme={emojiPickerTheme()}
          handleFile = {handleFile}
          errors={errors}
        /> :
          <div className='p-5 text-center font-bold uppercase'>
              please log in to comment
          </div>
      }

      {file !== null && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-bg-alt p-4 ">
          <div key={file._id}>
            {file?.file?.type.startsWith('video') ? (
              <div className='relative border border-primary aspect-video'>
                <video
                  src={file?.previewUrl}
                  className="w-full h-full object-contain"
                  controls
                />
                <button onClick={() => handleRemove()} className='w-6 h-6 text-sm absolute top-2 right-3 rounded-full bg-bg'>X</button>
              </div>

            ) : (
              <div className='relative aspect-video'>
                <img
                  src={file?.previewUrl}
                  className="h-full w-full object-contain bg-black"
                />
                <button onClick={() => handleRemove()} className='w-6 h-6 text-sm absolute top-2 right-3 rounded-full bg-bg'>X</button>
              </div>

            )}
          </div>
        </div>
      )}

      {
        gif !== null && <GifPreview gif={gif} onRemove={handleRemoveGif} />
      }

      {showGif ? <SearchExperience onSelect = {handleSelectGif} /> : null }


      <div className="space-y-6 mt-5">
        {
          comments.length > 0 && comments.map(comment => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onReply={addReply}
              onEdit = {handleEdit}
            />
          ))
        }
      </div>

      <div className="mt-8 mb-8 text-center">
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
          </button>
        )}

      </div>

      { uploading && <TransferProgressBar
        ref={uploadBarRef}
        cancelUpload={cancelUpload}
      /> }
    </section>
  )
}

export default CommentList
