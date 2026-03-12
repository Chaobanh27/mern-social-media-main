import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import { Plus } from 'lucide-react'
import { memo, useState } from 'react'
import StoryOverlay from './StoryOverlay'
import CreateStoryModal from './CreateStoryModal'
import { AnimatePresence } from 'framer-motion'
import { useGetStories } from '~/hooks/TanstackQuery'
// import { userStore } from '~/zustand/userStore'

const StoryBar = memo(
  function StoryBar() {
    const [showModal, setShowModal] = useState(false)
    const [activeStory, setActiveStory] = useState(null)
    const { data: stories, isLoading } = useGetStories()

    //Sẽ giới hạn mỗi user chỉ 1 story trong 24h
    // const { user } = userStore(u => u)

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
          {stories?.map(story => (
            <SwiperSlide key={story._id} className="w-16!">
              <div
                onClick={() => setActiveStory(story)}
                className="text-center cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-accent p-0.5">
                  <img
                    src={story?.user?.profilePicture}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <p className="text-xs mt-1 truncate">{story?.user?.username}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <AnimatePresence>
          {showModal ? <CreateStoryModal showModal={showModal} onClose={() => setShowModal(false)}/> : null}
          {activeStory ? <StoryOverlay
            stories={stories}
            activeStory={activeStory}
            setActiveStory = {setActiveStory}
            onClose={() => setActiveStory(null)}
          /> : null }
        </AnimatePresence>

      </div>
    )
  })

export default StoryBar
