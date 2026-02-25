import { X } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import Modal from '../ui/Modal'
import VideoJS from '../videojs/VideoJs'

// Import Swiper styles (đảm bảo bạn đã import ở đâu đó trong app)
import 'swiper/css'
import 'swiper/css/navigation'

const MediaModal = ({ media = [], videoJsOptions={ videoJsOptions }, activeImage, onClose }) => {
  // Tìm index của item đang được chọn (activeImage có thể là id hoặc index)
  // Trong PostCard, ta truyền activeImage là item._id hoặc index
  const initialIndex = media.findIndex(item => item._id === activeImage)

  // Tránh render nếu không có dữ liệu
  if (activeImage === null) return null

  return (
    <Modal
      showModal={activeImage !== null}
      onClose={onClose}
      // Thêm các class để modal phủ kín màn hình
      className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center"
    >
      {/* Nút Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-110 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <X size={28} />
      </button>

      <Swiper
        modules={[Navigation]}
        navigation={true}
        initialSlide={initialIndex !== -1 ? initialIndex : 0}
        slidesPerView={1}
        className="w-full h-full flex items-center"
      >
        {media.map((item, i) => (
          <SwiperSlide
            key={item._id || i}
            className="flex justify-center items-center bg-transparent p-4 md:p-12"
          >
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              {item.type === 'video' ? (
                <div
                  className="w-full max-w-5xl shadow-2xl overflow-hidden rounded-lg swiper-no-swiping"
                  onClick={(e) => e.stopPropagation()} // Quan trọng: Ngăn click vào thanh tua làm đóng modal
                  onMouseDown={(e) => e.stopPropagation()} // Ngăn Swiper bắt sự kiện kéo
                >
                  <VideoJS
                    options={{
                      ...videoJsOptions,
                      sources: [{ src: item.url, type: item.mimeType || 'video/mp4' }]
                    }}
                  />
                </div>
              ) : (
                <img
                  src={item.url}
                  alt=""
                  loading='lazy'
                  className="max-w-full max-h-full object-contain select-none"
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </Modal>
  )
}

export default MediaModal