import CommentItem from './CommentItem'

const CommentList = () => {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <CommentItem key={i} />
      ))}
    </div>
  )
}

export default CommentList
