import EmojiPicker from 'emoji-picker-react'
import { Image, ImagePlay, SmilePlus } from 'lucide-react'
import { useUserStore } from '~/zustand/userStore'

const CommentInput = ({ register, handleSubmit, handleFile, onSubmit, errors, setShowEmoji, showEmoji, setShowGif, showGif, onEmoji, theme }) => {
  const currentUser = useUserStore(s => s.user)
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-6 grid grid-cols-1 sm:grid-cols-12 gap-4">
      <div className="sm:col-span-1 flex items-start justify-center">
        {currentUser ? <img src={currentUser?.profilePicture} className='w-10 h-10 rounded-full object-cover' alt="" /> : null}
      </div>
      <div className="sm:col-span-11 space-y-2">
        <textarea
          {...register('content', {
            required: 'comment is required',
            minLength: {
              value: 1,
              message: 'Minium 1 characters long'
            },
            maxLength: {
              value: 200,
              message: 'Maximum 200 characters long'
            }
          })}
          placeholder="write your comment..."
          className="w-full min-h-20 p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue"
        />
        <div className='flex items-center justify-between'>
          <div></div>
          <div className='flex items-center gap-3'>
            <button type='button' onClick={() => setShowGif(!showGif)}>
              <ImagePlay/>
            </button>
            <label className="cursor-pointer">
              <Image />
              <input
                type="file"
                accept="image/*"
                name='image'
                hidden
                onChange={handleFile}
              />
            </label>
            <button
              type="button"
              onClick={() => setShowEmoji((prev) => !prev)}
              className=""
            >
              <SmilePlus/>
            </button>
            <button type="submit" className="px-4 py-2 rounded-md bg-blue text-primary-text bg-accent">Post comment</button>
          </div>

        </div>

        {
          showEmoji && (
            <div className='messenger-emoji-container'>
              <EmojiPicker
                onEmojiClick={onEmoji}
                emojiStyle = {'native'}
                theme={theme}
                height={300}
                width={500}
                emojiSize={22}
                previewConfig={{
                  showPreview: false
                }}
              />
            </div>
          )
        }

        {errors.content && <span className='text-red-600'>{errors.content?.message}</span>}
      </div>
    </form>
  )
}

export default CommentInput

