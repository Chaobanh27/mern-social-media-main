import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import CommentActions from './CommentActions'
import { useCommentStore } from '~/zustand/useCommentStore'
import { useForm } from 'react-hook-form'
import { useToggleActive, useUpdateComment } from '~/hooks/TanstackQuery'
import { usePostStore } from '~/zustand/usePostStore'
import ModalAlert from '../ui/ModalAlert'
import { useState } from 'react'
import TextAreaAutoSize from 'react-textarea-autosize'

const ReplyItem = ({ reply }) => {
  const [openModal, setOpenModal] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({})
  dayjs.extend(relativeTime)
  const { activeInput, resetInput } = useCommentStore()
  const isEditOpen = activeInput.commentId === reply._id && activeInput.type === 'edit'
  const isEmojiPickerOpen = activeInput.commentId === reply._id && activeInput.type === 'reaction'
  const postId = usePostStore(s => s.postId)
  const updateCommentMutation = useUpdateComment(postId)
  const toggleActive = useToggleActive()

  const handleEdit = async (data) => {
    const payload = {
      ...data,
      postId: postId
    }
    await updateCommentMutation.mutateAsync({ commentId: reply?._id, data:payload }, {
      onSuccess:() => {
        resetInput()
      }
    })
  }

  const handleDelete = (replyId) => {
    setOpenModal(false)
    toggleActive.mutate({ name: 'comments', id: replyId, postId: postId })
  }

  return (
    <>
      <ModalAlert
        open={openModal}
        onClose={() => setOpenModal(false)}
        onDelete = {() => handleDelete(reply._id)}
        title="Confirm Delete"
      >
        <p>Do you want to delete this comment ?</p>
      </ModalAlert>
      <div key={reply._id} className="mt-4 ml-5 space-y-4">
        <div className="flex gap-3">
          <img src={reply?.user?.profilePicture} alt="" className='w-12 h-12 rounded-full object-cover' />
          <div className='text-primary-text w-full'>
            <div className="text-sm font-medium">{reply?.user?.username}</div>
            <div className="text-xs  ">{dayjs(reply?.createdAt).fromNow()}</div>
            {
              isEditOpen ? (
                <form onSubmit={handleSubmit(handleEdit)}>
                  {/* <textarea
                    {...register('content', { required: 'comment is required' })}
                    defaultValue={reply?.content}
                    placeholder="Viết bình luận của bạn..."
                    className="w-full mt-2 min-h-20 p-3 rounded-md border"
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
                    defaultValue={reply?.content}
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
                    {reply?.content}
                  </div>
                  <CommentActions
                    reply={reply}
                    openDelete={() => setOpenModal(true)}
                    isEmojiPickerOpen = {isEmojiPickerOpen}
                    type = {'reply'}
                  />
                </>
              )
            }

          </div>
        </div>

      </div>
    </>

  )
}

export default ReplyItem

