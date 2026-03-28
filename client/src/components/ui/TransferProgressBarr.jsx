import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useImperativeHandle, useRef } from 'react'

const TransferProgressBar = ( { cancelUpload, ref }) => {
  const progress = useMotionValue(0)
  const width = useTransform(progress, [0, 100], ['0%', '100%'])

  const sizeRef = useRef(null)
  const totalRef = useRef(null)
  const percentRef = useRef(null)

  // Hàm hỗ trợ format dung lượng
  const formatSize = (bytes) => {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB'
    return (bytes / 1024).toFixed(2) + ' KB'
  }

  useImperativeHandle(ref, () => ({
    updateProgress: ({ safeLoaded, totalSize, percent }) => {
      // 1. Làm mượt thanh progress bằng animate (Framer Motion)
      animate(progress, percent, { duration: 0.4, ease: 'easeOut' })

      // 2. Cập nhật Text trực tiếp qua Ref (Không re-render)
      if (percentRef.current) percentRef.current.textContent = `${percent}%`
      if (sizeRef.current) sizeRef.current.textContent = formatSize(safeLoaded)
      if (totalRef.current) totalRef.current.textContent = formatSize(totalSize)
    }
  }))

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xs md:max-w-2xl px-4">
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
          <motion.div
            style={{ width }}
            className="h-full bg-accent shadow-[0_0_15px_rgba(var(--color-accent),0.5)]"
          />
        </div>

        <div className="flex mt-4 justify-between text-xs font-medium text-white/70">
          <div className="flex gap-1">
            <span ref={sizeRef}>0 KB</span>
            <span className="opacity-40">/</span>
            <span ref={totalRef}>0 KB</span>
          </div>

          <div className="flex gap-4 items-center">
            <span ref={percentRef} className="text-accent font-bold">0%</span>
            <button
              onClick={cancelUpload}
              className="px-3 py-1 bg-white/10 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransferProgressBar