import { Send } from 'lucide-react'

const ChatInput = () => {
  return (
    <div className="border-t p-3 flex gap-2">
      <input
        placeholder="Type a message..."
        className="
          flex-1 px-3 py-2
          border rounded-full
          outline-none
        "
      />
      <button className="
        w-10 h-10 rounded-full
        bg-blue-600 text-white
        flex items-center justify-center
      ">
        <Send size={18} />
      </button>
    </div>
  )
}

export default ChatInput
