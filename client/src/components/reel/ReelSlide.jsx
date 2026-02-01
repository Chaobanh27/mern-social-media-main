import { useRef, useEffect } from 'react'
import { useVideoPlayer } from '~/hooks/useVideoPlayer'
import ReelControls from './ReelControls'
import ReelActions from './ReelActions'

const ReelSlide = ({ video, isActive }) => {
  const videoRef = useRef(null)
  const player = useVideoPlayer(videoRef)

  useEffect(() => {
    if (!videoRef.current) return

    if (isActive) {
      videoRef.current.play()
    } else {
      videoRef.current.pause()
    }
  }, [isActive])


  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        src={video.src}
        loop
        playsInline
        className="h-full w-full object-contain"
      />

      <ReelControls {...player} />

      <div className='absolute right-5 bottom-5'>
        <ReelActions video={video} />
      </div>
    </div>
  )
}

export default ReelSlide
