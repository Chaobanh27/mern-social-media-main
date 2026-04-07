import { memo, useMemo, useState } from 'react'
import { CheckCircle, LoaderCircle, Smile } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import EmojiPickerModal from '../ui/EmojiPickerModal'
import { REACTION_MAP } from '~/utils/constants'
import { useToggleReaction } from '~/hooks/TanstackQuery'
import { useChatStore } from '~/zustand/useChatStore'
import { useSocketStore } from '~/zustand/useSocketStore'
import clsx from 'clsx'
import { ErrorIcon } from 'react-hot-toast'
import GiphyContent from '../ui/GiphyContent'

const MessageItem = memo(({ message, isOwn }) => {
  const [showPicker, setShowPicker] = useState(false)
  const socket = useSocketStore(s => s.getSocket())
  const { selectedConversation } = useChatStore()
  const toggleReactionMutation = useToggleReaction()
  const { reactionSummary } = message

  const onReactionClick = (e) => {
    const selectedEmoji = e.emoji
    let reactionType
    const arr = Object.values(REACTION_MAP)
    for ( const e of arr) {
      if (selectedEmoji === e.icon) {
        reactionType = e.label
      }
    }
    toggleReactionMutation.mutate({ targetId: message._id, reactionType: reactionType, targetType: 'message', conversationId: selectedConversation._id, socketId: socket.id })
  }

  const { sortedReactionSummary, maxReaction, totalReactions } = useMemo(() => {
    const summary = message?.reactionSummary
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
  }, [message?.reactionSummary])


  const renderMedia = () => {
    const media = message?.media || []
    if (media.length === 0) return null

    let gridCols
    if (media.length === 1) {
      gridCols = 'grid-cols-1'
    } else if (media.length === 2) {
      gridCols = 'grid-cols-2'
    } else {
      gridCols = 'grid-cols-3'
    }

    return (
      <div className={clsx('grid gap-1 mt-2 mb-1 rounded-xl overflow-hidden', gridCols)}>
        {media.map((item, index) => (
          <div key={item._id || index} className={clsx('relative group/media cursor-pointer bg-black/10', {
            'aspect-square': media.length > 1,
            'max-h-80': media.length === 1
          })}>
            {item.type === 'video' ? (
              <div className="relative h-full w-full">
                <video src={item.url} className="h-full w-full object-cover" controls />
              </div>
            ) : (
              <img src={item.url} alt="media" className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" />
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderGif = () => {
    if (!message?.giphy) return null
    return (
      <GiphyContent giphy={message.giphy} />
    )
  }

  const renderStatus = () => {
    if (message.status === 'sending') return <LoaderCircle size={12} /> // Đang gửi
    if (message.status === 'error') return <ErrorIcon size={12} /> // Gửi lỗi
    return <CheckCircle size={12} /> // Đã gửi (từ DB)
  }

  return (
    <div className={clsx('flex items-end group relative', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      <img className="w-10 h-10 rounded-full shrink-0" src={message?.sender?.profilePicture} alt="" />

      <div className="relative max-w-[70%] mx-3">
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 10 }}
              className={`
                absolute bottom-full 
                ${isOwn ? 'right-0' : 'left-0'}
              `}
            >
              <EmojiPickerModal onReactionClick={onReactionClick} type={'reaction'}/>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={clsx('px-3 py-2 rounded-2xl text-sm', isOwn ? 'bg-accent text-primary-text' : 'border')}>
          {renderMedia()}
          {renderGif()}
          {message?.content}
          <div className='flex justify-end'>
            {renderStatus()}
          </div>
        </div>

        <div className={`
          absolute top-1/2 -translate-y-1/2 
          ${isOwn ? 'right-full mr-2' : 'left-full ml-2'}
          transition-opacity ${showPicker ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="p-1.5 rounded-full border bg-primary-text text-primary"
          >
            <Smile size={16} />
          </button>
        </div>

        {
          message?.myReaction !== null && totalReactions > 0 && (
            <div className={`absolute -bottom-4 flex bg-white border rounded-full px-1.5 py-0.5 shadow-sm space-x-1 ${isOwn ? 'right-2' : 'left-2'}`}>
              {message?.myReaction ? <span className='text-[11px]'>{REACTION_MAP[message?.myReaction]?.icon}</span> : null}
              <span className="text-[10px] font-bold text-primary">{totalReactions}</span>
            </div>
          )
        }
        {
          message?.myReaction === null && reactionSummary && Object.keys(reactionSummary).length > 0 && totalReactions > 0 && (
            <div className={`absolute -bottom-4 flex bg-white border rounded-full px-1.5 py-0.5 shadow-sm space-x-1 ${isOwn ? 'right-2' : 'left-2'}`}>
              <span className='text-[11px]' >{REACTION_MAP[maxReaction].icon}</span>
              <span className="text-[10px] font-bold text-primary">{totalReactions}</span>
            </div>
          )
        }
      </div>
    </div>
  )
})

export default MessageItem