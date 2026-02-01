import PostHeader from './PostHeader'
import PostContent from './PostContent'
import PostActions from './PostActions'
import PostMedia from './PostMedia'

const PostSection = () => {
  return (
    <div className="bg-bg-card rounded-xl">
      <PostHeader />
      <PostContent />
      <PostMedia />
      <PostActions />
    </div>
  )
}

export default PostSection
