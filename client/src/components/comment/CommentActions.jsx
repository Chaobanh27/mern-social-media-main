import { CircleX, MessageCircle, Pencil, SmilePlus, Trash } from 'lucide-react'
import { useMemo, useState } from 'react'
import EmojiPickerModal from '../ui/EmojiPickerModal'
import { REACTION_MAP } from '~/utils/constants'
import { useCommentStore } from '~/zustand/useCommentStore'
import { useUserStore } from '~/zustand/userStore'
import { useToggleReaction } from '~/hooks/TanstackQuery'
import { usePostStore } from '~/zustand/usePostStore'
import { motion, AnimatePresence } from 'framer-motion'

const CommentActions = ({ comment, reply, type, isReplyOpen, openDelete, isEmojiPickerOpen }) => {
  const currentUser = useUserStore(s => s.user)
  const { setActiveInput, resetInput } = useCommentStore()
  const toggleReactionMutation = useToggleReaction()
  const { postId } = usePostStore()

  const onReactionClick = (e) => {
    const selectedEmoji = e.emoji
    let reactionType
    const arr = Object.values(REACTION_MAP)
    for ( const e of arr) {
      if (selectedEmoji === e.icon) {
        reactionType = e.label
      }
    }
    resetInput()
    toggleReactionMutation.mutate({ targetId: type === 'comment' ? comment?._id : reply._id, reactionType: reactionType, targetType: 'comment', postId: postId })
  }

  const { maxReaction, totalReactions } = useMemo(() => {
    const summary = comment?.reactionSummary
    if (!summary || Object.keys(summary).length === 0) {
      return {
        maxReation: null,
        totalReactions: 0
      }
    }

    const sorted = Object.entries(summary).sort((a, b) => b[1] - a[1])
    const total = Object.values(summary).reduce((sum, val) => sum + val, 0)

    return {
      maxReaction: sorted[0][0],
      totalReactions: total
    }

  }, [comment?.reactionSummary])

  if (type === 'comment') {
    return (
      <>
        <div className="relative mt-2 flex items-center gap-2 text-sm text-primary">
          <AnimatePresence>
            {isEmojiPickerOpen && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.5, opacity: 0, y: 10 }}
                className='absolute bottom-full flex items-center'

              >
                <EmojiPickerModal onReactionClick={onReactionClick} type={'reaction'}/>
                <button
                  type='button'
                  onClick={resetInput}
                >
                  <CircleX size={19}/>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {
            comment?.myReaction !== null && totalReactions > 0 && (
              <>
                <button type='button' className="hover:text-accent-hover" onClick={() => setActiveInput(comment?._id, 'reaction' )}>
                  {comment?.myReaction ? <span className='text-[19px]'>{REACTION_MAP[comment?.myReaction]?.icon}</span> : null}
                </button>
                <span className="text-[15px] font-bold text-primary">{totalReactions}</span>
              </>
            )
          }
          {
            comment?.myReaction === null && comment?.reactionSummary && Object.keys(comment?.reactionSummary).length > 0 && totalReactions > 0 && (
              <>
                <span className='text-[19px]' >{maxReaction && REACTION_MAP[maxReaction].icon}</span>
                <span className="text-[15px] font-bold text-primary">{totalReactions}</span>
                <button type='button' className="hover:text-accent-hover" onClick={() => setActiveInput(comment?._id, 'reaction' )}>
                  <SmilePlus size={19}/>
                </button>
              </>
            )
          }
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
      <div className="relative mt-2 flex items-center gap-2 text-sm text-primary">
        <AnimatePresence>
          {isEmojiPickerOpen && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 10 }}
              className='absolute bottom-full flex items-center'

            >
              <EmojiPickerModal onReactionClick={onReactionClick} type={'reaction'}/>
              <button
                type='button'
                onClick={resetInput}
              >
                <CircleX size={19}/>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {
          reply?.myReaction !== null && totalReactions > 0 && (
            <>
              <button type='button' className="hover:text-accent-hover" onClick={() => setActiveInput(reply?._id, 'reaction' )}>
                {reply?.myReaction ? <span className='text-[19px]'>{REACTION_MAP[reply?.myReaction]?.icon}</span> : null}
              </button>
              <span className="text-[15px] font-bold text-primary">{totalReactions}</span>
            </>
          )
        }
        {
          reply?.myReaction === null && reply?.reactionSummary && Object.keys(reply?.reactionSummary).length > 0 && totalReactions > 0 && (
            <>
              <span className='text-[19px]' >{maxReaction && REACTION_MAP[maxReaction].icon}</span>
              <span className="text-[15px] font-bold text-primary">{totalReactions}</span>
              <button type='button' className="hover:text-accent-hover" onClick={() => setActiveInput(reply?._id, 'reaction' )}>
                <SmilePlus size={19}/>
              </button>
            </>
          )
        }
        {/* <button type='button' className="hover:text-accent-hover" onClick={() => setActiveInput(reply?._id, 'reaction' )}>
          {emoji ? <span className='text-[19px]'>{emoji}</span> : (reply?.myReaction === REACTION_MAP[reply?.myReaction]?.label ? <span className='text-[19px]'>{REACTION_MAP[reply?.myReaction]?.icon}</span> : <SmilePlus size={19}/>)}
        </button> */}
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

