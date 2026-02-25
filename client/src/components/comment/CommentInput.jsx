const CommentInput = ({ isReply }) => {
  return (
    <div className={`flex gap-2 ${isReply ? 'pl-4' : ''}`}>
      <img src="https://picsum.photos/200/300" alt="" className="w-8 h-8 rounded-full bg-gray-300"/>
      <textarea
        rows={1}
        className="flex-1 text-sm outline-none px-3 py-2 "
        placeholder={isReply ? 'Write a reply...' : 'Write a comment...'}
      />
    </div>
  )
}

export default CommentInput
