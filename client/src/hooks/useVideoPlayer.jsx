import { useEffect, useState } from 'react'

export const useVideoPlayer = (videoRef) => {
  const [isPlaying, setIsPlaying] = useState(true)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onLoaded = () => setDuration(video.duration)
    const onTimeUpdate = () => setCurrentTime(video.currentTime)

    video.addEventListener('loadedmetadata', onLoaded)
    video.addEventListener('timeupdate', onTimeUpdate)

    return () => {
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('timeupdate', onTimeUpdate)
    }
  }, [videoRef])

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

  const seek = (time) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = time
  }

  return {
    isPlaying,
    duration,
    currentTime,
    togglePlay,
    seek
  }
}
