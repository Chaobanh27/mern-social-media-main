import { Phone, Video } from 'lucide-react'

const ChatHeader = () => {
  return (
    <div className="
      h-14 px-4 border-b
      flex items-center justify-between
    ">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-300" />
        <span className="font-medium">Username</span>
      </div>

      <div className="flex gap-2">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Phone size={18}/>
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Video size={18}/>
        </button>
      </div>
    </div>
  )
}


export default ChatHeader
