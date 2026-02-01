import { Swiper, SwiperSlide } from 'swiper/react'
import ReelSlide from '~/components/reel/ReelSlide'
import { Mousewheel } from 'swiper/modules'

const videos = [
  {
    id: 1,
    src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    user: 'nguyenbao',
    desc: 'First video'
  },
  {
    id: 2,
    src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    user: 'react.dev',
    desc: 'Swiper + Framer Motion'
  },
  {
    id: 3,
    src: 'https://www.pexels.com/download/video/15283173/',
    user: 'react.dev',
    desc: 'Swiper + Framer Motion'
  },
  {
    id: 4,
    src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    user: 'react.dev',
    desc: 'Swiper + Framer Motion'
  }
]

const Reels = () => {
  return (
    <div className="w-full h-[calc(100svh-112px)] md:h-[calc(100svh-56px)] bg-black">
      <Swiper
        direction="vertical"
        modules={[Mousewheel]}
        mousewheel
        slidesPerView={1}
        className="h-full w-full"
      >
        {videos.map(video => (
          <SwiperSlide key={video.id}>
            {({ isActive }) => (
              <ReelSlide video={video} isActive={isActive} />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}


export default Reels
