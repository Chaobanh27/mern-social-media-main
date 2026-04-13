import { AnimatePresence, useInView } from 'framer-motion'
import { Loader2, Plus } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import CreatePostModal from '~/components/post/CreatePostModal'
import PostCard from '~/components/post/PostCard'
import StoryBar from '~/components/story/StoryBar'
import { useGetFeed } from '~/hooks/TanstackQuery'
import { useUserStore } from '~/zustand/userStore'

const Feed = () => {
  const [showModal, setShowModal] = useState(false)
  const currentUser = useUserStore(s => s.user)
  const limit = 5

  // const ref = useRef(null)
  // once: true nghĩa là chỉ kích hoạt 1 lần (giống triggerOnce)
  // const isInView = useInView(ref, { once: false, amount: 0.5 })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useGetFeed(currentUser._id, limit)

  const posts = useMemo(() => {
    return data?.pages.flatMap(p => p.data) || []
  }, [data])


  // const Components = useMemo(() => ({
  //   Header: () => (
  //     <>
  //       <StoryBar />
  //       <div className='w-full h-14 mt-4 mb-4 rounded-lg bg-bg-alt transition-slow flex justify-between items-center px-4'>
  //         <button onClick={() => setShowModal(true)} className='bg-accent hover:bg-accent-hover rounded-full text-primary-text'>
  //           <Plus/>
  //         </button>
  //       </div>
  //     </>
  //   ),
  //   Footer: () => isFetchingNextPage ? (
  //     <div className="flex justify-center p-4">
  //       <Loader2 className="w-6 h-6 animate-spin text-primary-text" />
  //     </div>
  //   ) : null
  // }), [isFetchingNextPage])

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

  return (
    <div className="max-w-200 mx-auto space-y-4">
      <StoryBar />
      <div className='w-full h-14 rounded-lg bg-bg-alt transition-slow flex justify-between items-center px-4'>
        <div></div>
        <button onClick={() => setShowModal(true)} className='bg-accent hover:bg-accent-hover rounded-full text-primary-text'>
          <Plus/>
        </button>
      </div>

      {
        isLoading ? <div className="flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div> :
          <Virtuoso
            useWindowScroll
            style={{ height: '100%' }}
            data={posts}
            endReached={handleEndReached}
            skipAnimationFrameInResizeObserver={true}
            itemContent={renderItemContent}
            // components={Components}
          />

      }

      {/* <div ref={ref}>
        <span
          style={{
            transform: isInView ? 'none' : 'translateX(-200px)',
            opacity: isInView ? 1 : 0,
            transition: 'all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.5s'
          }}
        >
          {isInView ? 'Tôi đã vào khung hình!' : 'Đang chờ...'}
        </span>
      </div> */}

      <AnimatePresence>
        {showModal ? <CreatePostModal showModal={showModal} onClose={() => setShowModal(false)}/> : null }
      </AnimatePresence>
    </div>
  )
}

export default Feed
