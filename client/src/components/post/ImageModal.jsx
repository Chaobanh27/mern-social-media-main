import { X } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import Modal from '../ui/Modal'
import { Navigation } from 'swiper/modules'

const ImageModal = ({ images, activeImage, onClose }) => {
  return (
    <Modal
      showModal={activeImage !== null ? true : false}
      activeImage={activeImage}
      onClose={onClose}
      className="w-full h-full"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white"
      >
        <X size={24} />
      </button>

      <Swiper
        modules={[Navigation]}
        navigation={true}
        initialSlide={activeImage}
        slidesPerView={1}
        className="w-full h-full"
      >
        {images.map((img, i) => (
          <SwiperSlide key={i} className="w-full h-full flex justify-center items-center">
            <img
              src={img}
              alt=""
              className="w-full h-full object-contain"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </Modal>
  )
}

export default ImageModal
