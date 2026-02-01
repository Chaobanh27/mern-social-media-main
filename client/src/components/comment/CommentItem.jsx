import { useState } from 'react'
import CommentActions from './CommentActions'
import ReplyList from './ReplyList'
import CommentInput from './CommentInput'

const CommentItem = () => {
  const [showReply, setShowReply] = useState(false)

  return (
    <div className="flex gap-2 overflow-hidden relative">
      <div className='relative'>
        <img src='https://picsum.photos/200/300' alt='' className="w-9 h-9 rounded-full bg-gray-300" />
        <div className="absolute left-1/2 top-9 w-px h-full bg-border -translate-x-1/2"></div>
      </div>

      <div className="flex-1">
        {/* Bubble */}
        <div className="px-3 py-2 rounded-xl text-sm">
          <p className="font-semibold text-xs">User</p>
          Nội dung comment
        </div>

        {/* Actions */}
        <CommentActions onReply={() => setShowReply(!showReply)} />

        {/* Reply input */}
        {showReply && (
          <div className="mt-2">
            <CommentInput isReply />
          </div>
        )}

        {/* Replies */}
        <ReplyList />
      </div>
    </div>
  )
}

export default CommentItem
