const PostHeader = ({ post }) => {
  return (
    <div className="flex items-center gap-3 p-4 h-18">
      <img src={post?.user?.profilePicture} alt='' className="w-10 h-10 rounded-full object-cover" />
      <div>
        <p className="text-sm font-semibold">{post?.user?.username}</p>
        <p className="text-xs text-gray-500">2 hours ago</p>
      </div>
    </div>
  )
}

export default PostHeader
