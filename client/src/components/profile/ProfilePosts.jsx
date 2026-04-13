import { useGetPostsByUser } from '~/hooks/TanstackQuery'
import PostCard from '../post/PostCard'
import { useCallback, useMemo } from 'react'
import { Virtuoso } from 'react-virtuoso'

const ProfilePosts = ({ userId }) => {
  const limit = 5
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useGetPostsByUser(userId, limit)

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const renderItemContent = useCallback((index, p) => (
    <div className="pb-4">
      <PostCard post={p} key={p._id}/>
    </div>
  ), [])

  const posts = useMemo(() => {
    return data?.pages.flatMap(p => p.data) || []
  }, [data])

  return (
    <>
      <Virtuoso
        useWindowScroll
        style={{ height: '100%' }}
        data={posts}
        endReached={handleEndReached}
        skipAnimationFrameInResizeObserver={true}
        itemContent={renderItemContent}
      />
    </>
  )
}

export default ProfilePosts