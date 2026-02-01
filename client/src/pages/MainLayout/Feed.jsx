import { Plus } from 'lucide-react'
import { useState } from 'react'
import CreatePostModal from '~/components/post/CreatePostModal'
import PostCard from '~/components/post/PostCard'
import StoryBar from '~/components/story/StoryBar'

const Feed = () => {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="max-w-200  mx-auto space-y-4">
      <StoryBar />
      <div className='w-full h-14 rounded-xl bg-bg-alt transition-slow flex justify-between items-center px-4'>
        <div></div>
        <button onClick={() => setShowModal(true)} className='bg-accent hover:bg-accent-hover rounded-full text-primary-text'>
          <Plus/>
        </button>
      </div>
      {[...Array(5)].map((_, i) => (
        <PostCard key={i} />
      ))}
      <CreatePostModal showModal={showModal} onClose={() => setShowModal(false)}/>
    </div>
  )
}

export default Feed
