import { useForm } from 'react-hook-form'
import { Image, ImagePlay, Send, Smile, X } from 'lucide-react'
import { useChatStore } from '~/zustand/useChatStore'
import { useNavigate } from 'react-router-dom'
import { useSendMessage } from '~/hooks/TanstackQuery'
import { useRef, useState } from 'react'
import EmojiPicker from 'emoji-picker-react'
import { useThemeStore } from '~/zustand/themeStore'
import SearchExperience from '../ui/Giphy'
import TypingIndicator from '../ui/TypingIndicator'
import { useSocketStore } from '~/zustand/useSocketStore'

const ChatInput = ({ receiverId }) => {
  const [showEmoji, setShowEmoji] = useState(false)
  const [showGif, setShowGif] = useState(false)
  const socket = useSocketStore(s => s.getSocket())
  const { selectedConversation, setSelectedConversation, setTempConversation } = useChatStore()
  const isTemp = selectedConversation?.isTemp
  const navigate = useNavigate()
  const isTypingRef = useRef(false)
  const typingTimeOutRef = useRef(null)
  const { register, handleSubmit, getValues, setValue, reset, control } = useForm({
    defaultValues: {
      message: '',
      file: null,
      gif: null
    }
  })

  const [preview, setPreview] = useState(null)
  const { currentTheme } = useThemeStore()
  const fileInputRef = useRef(null)
  const sendMessage = useSendMessage(selectedConversation?._id)

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
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview({ url, type: file.type })
    }
  }

  const clearPreview = () => {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
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

  const onSubmit = (data) => {
    if (!data.message.trim()) return
    sendMessage.mutate({
      ...data,
      receiverId: isTemp ? receiverId : selectedConversation.receiverId,
      conversationId: isTemp ? null : selectedConversation._id,
      conversationType: selectedConversation.type === 'private' ? 'private' : 'group',
      socketId: socket.id
    }, {
      onSuccess: (res) => {
        if (isTemp && res) {
          navigate(`/conversation/${res.conversationId}`, { replace: true })
          setSelectedConversation({
            ...selectedConversation,
            _id: res.conversationId,
            isTemp: false
          })
        }

        reset()
        return
      }
    })

  }

  return (
    <div className="flex flex-col w-full bg-bg">
      <TypingIndicator control={control} isTypingRef={isTypingRef} typingTimeOutRef={typingTimeOutRef} />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-3 flex items-center gap-2 h-14"
      >
        <div className='relative flex items-center gap-2'>
          {
            showEmoji && (
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
            )
          }

          {
            preview && (
              <div className="p-2 flex justify-start absolute bottom-full w-2xs mb-3 ">
                <div className="relative max-w-50 overflow-hidden shadow-sm">
                  {preview.type.startsWith('video') ? (
                    <video src={preview.url} className="h-32 w-auto object-cover" />
                  ) : (
                    <img src={preview.url} alt="preview" className="h-32 w-auto object-cover" />
                  )}
                  <button
                    onClick={clearPreview}
                    className="absolute top-1 right-1 bg-gray-800/70 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )
          }

          {
            showGif ?
              <div className='absolute bottom-full w-2xs mb-3'>
                <SearchExperience onSelect = {handleSelectGif} />
              </div>
              : null
          }

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
        </div>


        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,video/*"
          className="hidden"
        />

        <input
          {...register('message', { required: !preview })}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border rounded-full outline-none"
        />

        <button
          type="submit"
          className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors shadow-md disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}

export default ChatInput