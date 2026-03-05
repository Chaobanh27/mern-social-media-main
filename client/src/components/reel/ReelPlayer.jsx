import { useRef, useEffect, useState } from 'react'
import ReelControls from './ReelControls'
import ReelActions from './ReelActions'
import { useMotionValue } from 'motion/react'

const ReelPlayer = ({ video, isActive }) => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)

  const progress = useMotionValue(0)

  const handleTimeUpdate = (e) => {
    const percent = (e.target.currentTime / e.target.duration) * 100
    progress.set(percent)
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

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
        onTimeUpdate={handleTimeUpdate}
        ref={videoRef}
        src={video.src}
        loop
        muted
        playsInline
        className="h-full w-full object-contain"
      />

      <ReelControls progress={progress} isPlaying={isPlaying} togglePlay={togglePlay} videoRef={videoRef} />

      <div className='absolute right-5 bottom-5'>
        <ReelActions video={video} />
      </div>
    </div>
  )
}

export default ReelPlayer
