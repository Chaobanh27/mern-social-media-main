import { useMemo } from 'react'
import { Pagination, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import VideoJS from '../videojs/VideoJs'

const PostMedia = ({ post }) => {
  const videoJsOptions = useMemo(() => ({
    autoplay: false,
    preload:'metadata',
    controls: true,
    responsive: true,
    fluid: true,
    aspectRatio: '16:9'
  }), [])
  return (
    <div className="w-full">
      <Swiper
        pagination={true}
        navigation={true}
        modules={[Pagination, Navigation]}
      >
        {
          post?.media?.map(m => {

            if (m?.mimeType.startsWith('video')) {
              return (
                <SwiperSlide key={m._id}>
                  <div
                    className="swiper-no-swiping"
                    onClick={(e) => e.stopPropagation()} // Quan trọng: Ngăn click vào thanh tua làm đóng modal
                    onMouseDown={(e) => e.stopPropagation()} // Ngăn Swiper bắt sự kiện kéo
                  >
                    <VideoJS
                      options={{
                        ...videoJsOptions,
                        sources: [{ src: m?.url, type: m?.mimeType || 'video/mp4' }]
                      }}
                    />
                  </div>
                </SwiperSlide>
              )
            }
            return (
              <SwiperSlide key={m._id}>
                <img src={m?.url} alt="" className='aspect-video object-contain' />
              </SwiperSlide>
            )
          })
        }
      </Swiper>
    </div>
  )
}

export default PostMedia
