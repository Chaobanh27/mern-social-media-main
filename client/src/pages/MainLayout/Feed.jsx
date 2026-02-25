import { AnimatePresence, useInView } from 'framer-motion'
import { Loader2, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import CreatePostModal from '~/components/post/CreatePostModal'
import PostCard from '~/components/post/PostCard'
import StoryBar from '~/components/story/StoryBar'
import { useGetPosts } from '~/hooks/TanstackQuery/usePostQueries'

const Feed = () => {
  const [showModal, setShowModal] = useState(false)
  // const ref = useRef(null)
  // once: true nghĩa là chỉ kích hoạt 1 lần (giống triggerOnce)
  // const isInView = useInView(ref, { once: false, amount: 0.5 })

  const { data: posts, isLoading } = useGetPosts()

  return (
    <div className="max-w-200  mx-auto space-y-4">
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
          posts?.map(post => (
            <PostCard post={post} key={post._id} />
          ))
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
