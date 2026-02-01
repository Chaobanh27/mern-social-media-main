import { MessageCircle } from 'lucide-react'

const FloatingChatButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-6 right-6 z-50
        w-14 h-14 rounded-full
        bg-black text-white
        shadow-lg
        flex items-center justify-center
        hover:scale-105 transition
      "
    >
      <MessageCircle size={24} />
    </button>
  )
}

export default FloatingChatButton
