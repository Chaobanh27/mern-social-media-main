import CommentActions from './CommentActions'

const ReplyItem = () => {
  return (
    <div className="flex gap-2 ">
      <img src='https://picsum.photos/200/300' alt='' className="w-7 h-7 rounded-full bg-gray-300" />
      <div>
        <div className="px-3 py-2 rounded-xl text-sm">
          <p className="font-semibold text-xs">User</p>
          Nội dung reply
        </div>
        <CommentActions />
      </div>
    </div>
  )
}

export default ReplyItem
