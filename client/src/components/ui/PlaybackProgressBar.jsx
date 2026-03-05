import { motion, useTransform } from 'motion/react'

const PlaybackProgressBar = ({ progress, color = 'bg-white' }) => {
  const width = useTransform(progress, [0, 100], ['0%', '100%'])

  return (
    <div className='w-full h-1 bg-primary overflow-hidden'>
      <motion.div
        style={{ width }}
        className={`h-full ${color}`}
      />
    </div>
  )
}

export default PlaybackProgressBar