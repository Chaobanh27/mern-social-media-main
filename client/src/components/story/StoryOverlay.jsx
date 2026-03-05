import { X } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import Modal from '../ui/Modal'
import 'swiper/css/navigation'
import StoryVideo from './StoryVideo'
import { useMotionValue, useSpring } from 'motion/react'
import { animate } from 'motion'
import { useEffect } from 'react'
import PlaybackProgressBar from '../ui/PlaybackProgressBar'

const StoryOverlay = ({ stories, setActiveStory, activeStory, onClose }) => {
  const index = stories.findIndex( s => s._id === activeStory._id)

  const progress = useMotionValue(0)

  const smoothProgress = useSpring(progress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const handleTimeUpdate = (e) => {
    const percent = (e.target.currentTime / e.target.duration) * 100
    progress.set(percent)
  }

  useEffect(() => {
    progress.set(0)
    let exitTimeOut

    if (activeStory?.storyType !== 'video') {
      const controls = animate(progress, 100, {
        duration: 5,
        ease: 'linear',
        onComplete: () => {
          exitTimeOut = setTimeout(() => {
            setActiveStory(null)
          }, 1000)
        }
      })
      return () => {
        controls.stop()
        clearTimeout(exitTimeOut)
      }
    }
  }, [activeStory?.storyType, progress, setActiveStory])

  const renderContent = (story, isActive) => {
    if (story?.storyType === 'image') {
      return (
        <img
          src={story?.media[0]?.url}
          alt=""
          className="w-full h-full object-contain "
        />

      )
    } else if (story?.storyType === 'video') {
      return (
        <StoryVideo onTimeUpdate={handleTimeUpdate} video={story?.media[0]?.url} isActive={isActive} />
      )
    } else {
      return (
        <div
          style={{ backgroundColor: story?.background }}
          className=' w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center'>
          {story?.content}
        </div>
      )
    }
  }

  return (
    <Modal
      showModal={activeStory !== null ? true : false}
      onClose={onClose}
      className="w-full h-full"
    >
      <PlaybackProgressBar progress={smoothProgress} />

      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white"
      >
        <X size={24} />
      </button>

      <div className='absolute top-4 left-4 rounded-xl font-bold bg-bg-alt py-2 px-4 z-50'>
        {
          activeStory?.user?.username
        }
      </div>

      <Swiper
        initialSlide={index}
        simulateTouch={false}
        allowTouchMove={false}
        slidesPerView={1}
        className="w-full h-full"
      >
        {stories.map(story => (
          <SwiperSlide key={story._id} className="w-full h-full flex justify-center items-center">
            {
              ({ isActive }) => renderContent(story, isActive)
            }
          </SwiperSlide>
        ))}
      </Swiper>
    </Modal>
  )
}

export default StoryOverlay
