import CommentInput from '~/components/comment/CommentInput'
import CommentList from '~/components/comment/CommentList'
import PostSection from '~/components/post/PostSection'

const PostDetail = () => {
  return (
    <div className="w-full flex justify-center">
      <div className="
        w-full max-w-300
        px-3 py-4
        grid grid-cols-1 lg:grid-cols-12 gap-4
      ">

        {/* Main */}
        <main className="lg:col-span-8 space-y-4">
          <PostSection />
          <CommentInput />
          <CommentList />
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
