import { useRef, useEffect } from 'react'

const StoryVideo = ({ onTimeUpdate, video, isActive }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (!videoRef.current) return

    if (isActive) {
      videoRef.current.play()
    } else {
      videoRef.current.pause()
    }
  }, [isActive])


  return (
    <video
      onTimeUpdate={onTimeUpdate}
      ref={videoRef}
      src={video}
      className="w-full h-full object-contain"
      autoPlay
      loop
    />

  )
}

export default StoryVideo
