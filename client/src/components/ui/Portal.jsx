import { createPortal } from 'react-dom'

const Portal = ({ children }) => {
  return createPortal(
    <div className="fixed inset-0 z-999 pointer-events-none">
      <div className="pointer-events-auto">{children}</div>
    </div>,
    document.body
  )
}

export default Portal
