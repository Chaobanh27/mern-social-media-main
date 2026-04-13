import { MessageSquare, Repeat, SmilePlus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToggleReaction } from '~/hooks/TanstackQuery'
import { REACTION_MAP } from '~/utils/constants'
import EmojiPickerModal from '../ui/EmojiPickerModal'
import CreatePostModal from './CreatePostModal'

const PostActions = ({ post }) => {
  const [showPicker, setShowPicker] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const checkPath = location.pathname.includes('detail')
  const toggleReactionMutation = useToggleReaction()

  const handleReactionClick = (e) => {
    const selectedEmoji = e.emoji
    let reactionType
    const arr = Object.values(REACTION_MAP)
    for ( const e of arr) {
      if (selectedEmoji === e.icon) {
        reactionType = e.label
      }
    }
    toggleReactionMutation.mutate({ targetId: post?._id, reactionType: reactionType, targetType: 'post' })
  }

  const { sortedReactionSummary, maxReaction, totalReactions } = useMemo(() => {
    const summary = post?.reactionSummary
    if (!summary || Object.keys(summary).length === 0) {
      return {
        sortedReactionSummary: [],
        maxReaction: null,
        totalReactions: 0
      }
    }
    const sorted = Object.entries(summary).sort((a, b) => b[1] - a[1])
    const total = Object.values(summary).reduce((sum, val) => sum + val, 0)

    return {
      sortedReactionSummary: sorted,
      maxReaction: sorted[0][0],
      totalReactions: total
    }
  }, [post?.reactionSummary])

  if (checkPath) {
    return (
      <div className="border-t h-11.25 border-border/50 text-sm px-4 py-2 flex justify-between">
        <div className='card-action-btn'>
          <SmilePlus size={18}/> 12
        </div>
        <div className='card-action-btn'>
          <MessageSquare size={18}/> 12
        </div>
        <div className='card-action-btn'>
          <Repeat size={18} /> 12
        </div>
      </div>
    )
  }

  return (
    <div className="border-t relative h-11.25 border-border/50 text-sm px-4 py-2 flex justify-between">
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 10 }}
            className='absolute bottom-full'
          >
            <EmojiPickerModal onReactionClick={handleReactionClick} type={'reaction'}/>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setShowPicker(!showPicker)}
        className='card-action-btn'>
        {
          post?.myReaction !== null ? (
            <>
              {post?.myReaction ? <span className='text-[18px]'>{REACTION_MAP[post?.myReaction]?.icon}</span> : null}
              <span className="text-[14px] font-bold text-primary">{totalReactions > 0 ? totalReactions : 0}</span>
            </>
          ) : (
            <>
              <SmilePlus size={18}/>
              <span className="text-[14px] font-bold text-primary">{totalReactions > 0 ? totalReactions : 0}</span>
            </>
          )
        }

      </button>
      <Link to={`/detail/${post?._id}`} className='card-action-btn'>
        <MessageSquare size={18}/> 12
      </Link>
      {
        !post.originalPost && (
          <button
            onClick={() => setShowModal(true)}
            className='card-action-btn'>
            <Repeat size={18} /> 12
          </button>
        )
      }


      <AnimatePresence>
        {showModal ? <CreatePostModal sharedPost={post} showModal={showModal} onClose={() => setShowModal(false)}/> : null }
      </AnimatePresence>
    </div>
  )
}

export default PostActions
