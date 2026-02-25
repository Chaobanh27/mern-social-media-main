import { motion } from 'framer-motion'
import { useEffect } from 'react'

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

const modalVariants = {
  hidden: { scale: 0.95, opacity: 0, y: 20 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  exit: { scale: 0.95, opacity: 0, y: 20 }
}

const Modal = ({ showModal, onClose, children, closeOnOverlay = true, showOverlay = true, className = '' }) => {

  //Lock scroll
  useEffect(() => {
    if (showModal) {document.body.style.overflow = 'hidden'}
    return () => (document.body.style.overflow = '')
  }, [showModal])

  //ESC close
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center ${
            showOverlay ? 'bg-black/80' : ''
          }`}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          // onClick={closeOnOverlay ? onClose : undefined}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className={className}
          >
            {children}
          </motion.div>
        </motion.div>
      }
    </>
  )
}

export default Modal
