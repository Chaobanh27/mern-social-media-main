import { Play, Pause } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import ReelProgressBar from '../ui/ReelProgressBar'

const ReelControls = ({ progress, isPlaying, togglePlay, videoRef }) => {
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => setShow(false), 2000)
    return () => clearTimeout(t)
  }, [show])

  return (
    <div
      className="absolute inset-0"
      onClick={() => setShow(true)}
    >
      <AnimatePresence>
        {show && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            onClick={togglePlay}
            className="absolute inset-0 m-auto h-16 w-16
                       rounded-full bg-black/60
                       flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause size={32} className="text-white" />
            ) : (
              <Play size={32} className="text-white ml-1" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
        <div
          className="h-1 w-full bg-white/30 rounded">
          <ReelProgressBar progressValue={progress} videoRef={videoRef}/>
        </div>
      </div>
    </div>
  )
}

export default ReelControls
