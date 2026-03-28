import { useState } from 'react'
import { useForm } from 'react-hook-form'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import ModalAlert from '../ui/ModalAlert'
import CommentActions from './CommentActions'
import { useCommentStore } from '~/zustand/useCommentStore'
import ReplyItem from './ReplyItem'
import GiphyContent from '../ui/GiphyContent'
import { useToggleActive } from '~/hooks/TanstackQuery'
import { usePostStore } from '~/zustand/usePostStore'
import TextAreaAutoSize from 'react-textarea-autosize'


const CommentItem = ({ comment, onReply, onEdit }) => {
  const [openModal, setOpenModal] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { _id: commentId, replies } = comment
  const postId = usePostStore(s => s.postId)

  dayjs.extend(relativeTime)

  const { activeInput, resetInput } = useCommentStore()
  const toggleActive = useToggleActive()

  const handleReplySubmit = async (data) => {
    await onReply(commentId, data.replyContent)
    resetInput()
  }

  const handleEdit = async (data) => {
    resetInput()
    await onEdit(commentId, data)
  }

  const handleDelete = (commentId) => {
    setOpenModal(false)
    toggleActive.mutate({ name: 'comments', id: commentId, postId: postId })
  }

  const isReplyOpen = activeInput.commentId === comment._id && activeInput.type === 'reply'
  const isEditOpen = activeInput.commentId === comment._id && activeInput.type === 'edit'
  const isEmojiPickerOpen = activeInput.commentId === comment._id && activeInput.type === 'reaction'

  return (
    <>
      <ModalAlert
        open={openModal}
        onClose={() => setOpenModal(false)}
        onDelete = {() => handleDelete(comment._id)}
        title="Confirm Delete"
      >
        <p>Do you want to delete this comment ?</p>
      </ModalAlert>
      <div className="flex gap-4">
        <img src={comment?.user?.profilePicture} alt="" className='w-12 h-12 rounded-full object-cover' />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{comment?.user?.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{dayjs(comment?.createdAt).fromNow()}</p>
            </div>
          </div>
          {
            isEditOpen ? (
              <form onSubmit={handleSubmit(handleEdit)}>
                {/* <textarea
                  {...register('content', { required: 'comment is required' })}
                  defaultValue={comment?.content}
                  placeholder="Viết bình luận của bạn..."
                  className="w-full bg-bg-alt mt-2 min-h-20 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
                /> */}
                <TextAreaAutoSize
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
                  defaultValue={comment?.content}
                  minRows={3}
                  maxRows={10}
                  placeholder="write your comment..."
                  className='w-full resize-none bg-bg-alt p-2 text-lg outline-none'

                />
                <div className='flex justify-end gap-2 text-xs'>
                  <button
                    type='submit'
                    className='hover:text-blue cursor-pointer'
                  >
                Save
                  </button>
                  <button
                    className='hover:text-blue cursor-pointer'
                    onClick={resetInput}
                  >
                Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  {comment?.content}
                  {
                    comment.giphy && <GiphyContent giphy={comment.giphy} />
                  }
                  {
                    comment.media &&
                    <div className='mt-3 w-2xs border'>
                      <img src={comment.media.url} className='w-full h-full ' alt='' />
                    </div>
                  }
                </div>

                <CommentActions
                  isReplyOpen={isReplyOpen}
                  comment={comment}
                  openDelete={() => setOpenModal(true)}
                  isEmojiPickerOpen = {isEmojiPickerOpen}
                  type = {'comment'}
                />
              </>
            )
          }


          {
            isReplyOpen && (
              <form onSubmit={handleSubmit(handleReplySubmit)} className="mb-6 grid grid-cols-1 sm:grid-cols-12 gap-4 mt-3">
                <div className="sm:col-span-10 space-y-2">
                  {/* <textarea
                    {...register('replyContent', { required: 'reply is required' })}
                    placeholder="Viết bình luận của bạn..."
                    className="w-full min-h-20 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue"
                  /> */}
                  <TextAreaAutoSize
                    {...register('replyContent', {
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
                    defaultValue={comment?.content}
                    minRows={3}
                    maxRows={10}
                    placeholder="write your comment..."
                    className='w-full resize-none bg-bg-alt p-2 text-lg outline-none'

                  />
                  {errors.replyContent && <span className='text-red-600'>{errors.replyContent?.message}</span>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <button type="button" onClick={resetInput}
                        className="px-3 py-1 rounded-md cursor-pointer">Cancel</button>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="submit" className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover cursor-pointer">Post comment</button>
                    </div>
                  </div>
                </div>
              </form>
            )
          }

          {
            replies?.length > 0 && replies?.map(r => (
              <ReplyItem
                key={r._id}
                reply={r}
                handleSubmit = {handleSubmit}
                register = {register}
              />
            ))
          }

        </div>
      </div>
    </>

  )
}

export default CommentItem
