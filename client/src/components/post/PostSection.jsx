import PostHeader from './PostHeader'
import PostContent from './PostContent'
import PostActions from './PostActions'
import PostMedia from './PostMedia'
import { useGetPost } from '~/hooks/TanstackQuery'


const PostSection = ({ postId }) => {
  const { data, isLoading } = useGetPost(postId)

  return (
    <div className="bg-bg-card rounded-xl">
      <PostHeader post={data} />
      <PostContent post={data} />
      <PostMedia post={data} />
      <PostActions post={data} />
    </div>
  )
}

export default PostSection
