const CommentActions = ({ onReply }) => {
  return (
    <div className="flex gap-4 pl-2 mt-1 text-xs text-gray-500">
      <button className="hover:underline">Like</button>
      <button onClick={onReply} className="hover:underline">Reply</button>
      <span>2h</span>
    </div>
  )
}

export default CommentActions
