import { Link } from 'react-router-dom'

const PostHeader = ({ post }) => {
  return (
    <div className="flex items-center gap-3 p-4 h-18">
      <img src={post?.user?.profilePicture} alt='' className="w-10 h-10 rounded-full object-cover" />
      <div>
        <Link className='cursor-pointer' to={`/profile/${post?.user?._id}`}>
          <p className="text-sm font-semibold">{post?.user?.username}</p>
        </Link>
        <p className="text-xs text-gray-500">2 hours ago</p>
      </div>
    </div>
  )
}

export default PostHeader
