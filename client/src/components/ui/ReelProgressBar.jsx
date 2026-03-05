import { motion, useTransform } from 'framer-motion'
import { useRef } from 'react'

const ReelProgressBar = ({ progressValue, videoRef }) => {
  const constraintsRef = useRef(null)
  const width = useTransform(progressValue, [0, 100], ['0%', '100%'])

  // Hàm xử lý khi click vào thanh progress để tua
  const handleSeek = (e) => {
    if (!videoRef.current || !constraintsRef.current) return

    const rect = constraintsRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left // Vị trí click chuột
    const width = rect.width
    const newPercent = (clickX / width) * 100

    // Cập nhật thời gian thực của video
    const newTime = (newPercent / 100) * videoRef.current.duration
    videoRef.current.currentTime = newTime
  }

  return (
    <div
      ref={constraintsRef}
      onClick={handleSeek}
      className="group relative w-full h-1.5 bg-white/20 cursor-pointer flex items-center"
    >
      {/* Vùng đệm để dễ click hơn */}
      <div className="absolute -top-2 -bottom-2 inset-x-0" />

      {/* Thanh progress chính */}
      <div className="relative w-full h-1 bg-transparent overflow-hidden rounded-full">
        <motion.div
          style={{ width }}
          className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        />
      </div>

      {/* Nút tròn nhỏ (Thumb) - Chỉ hiện khi hover */}
      <motion.div
        style={{ left: width }}
        className="absolute w-3 h-3 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform shadow-md"
      />
    </div>
  )
}

export default ReelProgressBar