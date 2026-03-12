import { CircleX, MessageCircle, Pencil, SmilePlus, Trash } from 'lucide-react'
import { useState } from 'react'
import EmojiPickerModal from '../ui/EmojiPickerModal'
import { REACTION_MAP } from '~/utils/constants'
import { useCommentStore } from '~/zustand/commentStore'
import { useUserStore } from '~/zustand/userStore'
import { useToggleReaction } from '~/hooks/TanstackQuery'

const CommentActions = ({ comment, reply, type, isReplyOpen, openDelete, isEmojiPickerOpen }) => {
  const [emoji, setEmoji] = useState(null)
  const currentUser = useUserStore(s => s.user)
  const { setActiveInput, resetInput } = useCommentStore()
  const toggleReactionMutation = useToggleReaction((type === 'comment' ? comment?._id : reply._id), 'comment')

  const onReactionClick = async (e) => {
    const selectedEmoji = e.emoji
    let reactionType
    const arr = Object.values(REACTION_MAP)
    for ( const e of arr) {
      if (selectedEmoji === e.icon) {
        reactionType = e.label
      }
    }
    setEmoji(e.emoji)
    resetInput()
    await toggleReactionMutation.mutateAsync({ reactionType: reactionType, targetType: 'comment' })
  }

  if (type === 'comment') {
    return (
      <>
        {
          isEmojiPickerOpen &&
        <div className='flex items-center mt-2 '>
          <div>
            <EmojiPickerModal onReactionClick={onReactionClick} type={'reaction'}/>
          </div>
          <button
            type='button'
            onClick={resetInput}
          >
            <CircleX size={19}/>
          </button>
        </div>
        }
        <div className="mt-2 flex items-center gap-2 text-sm text-primary">
          <button type='button' className="hover:text-accent-hover" onClick={() => setActiveInput(comment?._id, 'reaction' )}>
            {emoji ? <span className='text-[19px]'>{emoji}</span> : (comment?.myReaction === REACTION_MAP[comment?.myReaction]?.label ? <span className='text-[19px]'>{REACTION_MAP[comment?.myReaction]?.icon}</span> : <SmilePlus size={19}/>)}
          </button>
          {currentUser ?
            <button type='button' className="hover:text-accent-hover cursor-pointer" onClick={() => setActiveInput(comment?._id, 'reply')}>
              <MessageCircle size={19} className={isReplyOpen && 'fill-blue'} />
            </button> :
            <button type='button' disabled className="hover:text-accent-hover cursor-pointer">
              <MessageCircle className={isReplyOpen && 'fill-blue'} />
            </button>}
          {currentUser?._id === comment?.user?._id ?
            <>
              <button type='button' onClick={() => setActiveInput(comment?._id, 'edit')} className="hover:text-accent-hover cursor-pointer"><Pencil size={19} /></button>
              <button type='button' onClick={openDelete} className="hover:text-accent-hover cursor-pointer"><Trash size={19} /></button>
            </> : null}
        </div>
      </>

    )
  }
  return (
    <>
      {
        isEmojiPickerOpen &&
        <div className='flex items-center mt-2 '>
          <div>
            <EmojiPickerModal onReactionClick={onReactionClick} type={'reaction'}/>
          </div>
          <button
            type='button'
            onClick={resetInput}
          >
            <CircleX size={19}/>
          </button>
        </div>
      }
      <div className="mt-2 flex items-center gap-2 text-sm text-primary">
        <button type='button' className="hover:text-accent-hover" onClick={() => setActiveInput(reply?._id, 'reaction' )}>
          {emoji ? <span className='text-[19px]'>{emoji}</span> : (reply?.myReaction === REACTION_MAP[reply?.myReaction]?.label ? <span className='text-[19px]'>{REACTION_MAP[reply?.myReaction]?.icon}</span> : <SmilePlus size={19}/>)}
        </button>
        {currentUser?._id === reply?.user?._id ?
          <>
            <button type='button' onClick={() => setActiveInput(reply?._id, 'edit')} className="hover:text-accent-hover cursor-pointer"><Pencil size={19} /></button>
            <button type='button' onClick={openDelete} className="hover:text-accent-hover cursor-pointer"><Trash size={19} /></button>
          </> : null}
      </div>
    </>

  )

}

export default CommentActions

