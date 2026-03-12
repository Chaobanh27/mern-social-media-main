import { useParams } from 'react-router-dom'
import CommentList from '~/components/comment/CommentList'
import PostSection from '~/components/post/PostSection'
import { usePostStore } from '~/zustand/postStore'
import { useEffect } from 'react'

const PostDetail = () => {

  const { postId } = useParams()
  const setPostId = usePostStore(s => s.setPostId)

  useEffect(() => {
    if (postId) setPostId(postId)
  }, [postId, setPostId])

  return (
    <div className="w-full flex justify-center">
      <div className="
        w-full max-w-300
        px-3 py-4
        grid grid-cols-1 lg:grid-cols-12 gap-4
      ">

        {/* Main */}
        <main className="lg:col-span-8 space-y-4">
          <PostSection postId = {postId} />
          <CommentList postId={postId} />
        </main>

        {/* Right sidebar */}
        <aside className="hidden lg:block lg:col-span-4">
          <div className="sticky top-20 space-y-3">
            <div className="p-3 border rounded-lg">Related</div>
            <div className="p-3 border rounded-lg">Suggest</div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default PostDetail
