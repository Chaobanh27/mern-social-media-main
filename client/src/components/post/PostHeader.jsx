import { Ellipsis, Pin } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePinPost, useToggleBookmark } from '~/hooks/TanstackQuery'
import { useUserStore } from '~/zustand/userStore'

const PostHeader = ({ post, isSharedChild }) => {
  const [dropDown, setDropDown] = useState(false)
  const currentUser = useUserStore(s => s.user)
  const useToggleBookmarkMutation = useToggleBookmark()
  const usePinPostMutation = usePinPost()

  const handleToggleBookmark = async () => {
    await useToggleBookmarkMutation.mutateAsync(post?._id)
  }

  const handlePinPost = async () => {
    await usePinPostMutation.mutateAsync(post?._id)
  }

  return (
    <div className="flex items-center justify-between gap-3 p-4 h-18">
      <div className='flex items-center gap-3 w-full'>
        <img src={post?.user?.profilePicture} alt='' className="w-10 h-10 rounded-full object-cover" />
        <div>
          <Link className='cursor-pointer' to={`/profile/${post?.user?._id}`}>
            <p className="text-sm font-semibold">{post?.user?.username}</p>
          </Link>
          <p className="text-xs text-gray-500">2 hours ago</p>
        </div>
      </div>
      <div className='relative flex justify-end w-full gap-4'>
        {
          !isSharedChild && (
            <>
              {
                post?.isPinned && <Pin className='fill-accent text-accent'/>
              }
              <button
                onClick={() => setDropDown(!dropDown)}
                className=''>
                <Ellipsis/>
              </button>
            </>
          )
        }
        {
          dropDown && (
            <div className='absolute border border-border top-full w-full flex flex-col z-50 '>
              {
                currentUser._id === post?.user?._id && (
                  <button
                    onClick={handlePinPost}
                    className='p-2 bg-bg hover:bg-accent-hover'>
                Pin Post
                  </button>
                )
              }

              <button
                onClick={handleToggleBookmark}
                className='p-2 bg-bg hover:bg-accent-hover'>
                Save Post
              </button>
            </div>
          )
        }
      </div>


    </div>
  )
}

export default PostHeader
