import { X } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import Modal from '../ui/Modal'
import { Navigation } from 'swiper/modules'
import 'swiper/css/navigation'

const StoryOverlay = ({ stories, activeStory, onClose }) => {
  return (
    <Modal
      showModal={activeStory !== null ? true : false}
      onClose={onClose}
      className="w-full"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white"
      >
        <X size={24} />
      </button>

      {/* Swiper */}
      <Swiper
        modules={[Navigation]}
        navigation={true}
        initialSlide={activeStory}
        slidesPerView={1}
        className="w-full h-full"
      >
        {stories.map((story, i) => (
          <SwiperSlide key={i} className="w-full h-full flex justify-center items-center">
            {story.type === 'image' ? (
              <img
                src={story.src}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={story.src}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </Modal>
  )
}

export default StoryOverlay
