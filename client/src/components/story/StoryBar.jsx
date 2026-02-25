import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import { Plus } from 'lucide-react'
import { memo, useState } from 'react'
import StoryOverlay from './StoryOverlay'
import CreateStoryModal from './CreateStoryModal'
import { AnimatePresence } from 'framer-motion'

const StoryBar = memo(
  function StoryBar() {
    const [showModal, setShowModal] = useState(false)
    const [activeStory, setActiveStory] = useState(null)

    const stories = [...Array(10)].map((_, i) => ({
      type: 'image',
      src: `https://picsum.photos/200/300?random=${i}`
    }))

    return (
      <div className="mt-4 p-4 bg-bg-alt transition-slow rounded-xl overflow-hidden">
        <Swiper
          modules={[FreeMode]}
          spaceBetween={12}
          slidesPerView="auto"
          freeMode
          className="px-4 py-4"
        >
          {/* Add Story */}
          <SwiperSlide className="w-16!">
            <div
              onClick={() => setShowModal(true)}
              className="text-center cursor-pointer">
              <div className="w-16 h-16 rounded-full text-primary-text flex justify-center items-center bg-accent">
                <Plus />
              </div>
              <p className="text-xs mt-1 truncate">Add Story</p>
            </div>
          </SwiperSlide>

          {/* Stories */}
          {stories.map((story, i) => (
            <SwiperSlide key={i} className="w-16!">
              <div
                onClick={() => setActiveStory(i)}
                className="text-center cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-linear-to-tr from-pink-500 to-yellow-400 p-0.5">
                  <img
                    src={story.src}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <p className="text-xs mt-1 truncate">User</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <AnimatePresence>
          {showModal ? <CreateStoryModal showModal={showModal} onClose={() => setShowModal(false)}/> : null}
          {activeStory ? <StoryOverlay
            stories={stories}
            activeStory={activeStory}
            onClose={() => setActiveStory(null)}
          /> : null }
        </AnimatePresence>

      </div>
    )
  })

export default StoryBar
