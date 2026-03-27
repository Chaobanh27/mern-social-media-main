import { Phone, Video } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCallStore } from '~/zustand/useCallStore'
import { useChatStore } from '~/zustand/useChatStore'
import { useUserStore } from '~/zustand/userStore'
import { useSocketStore } from '~/zustand/useSocketStore'

const ChatHeader = ({ receiverId }) => {
  const [typer, setTyper] = useState(null)
  const socket = useSocketStore(s => s.getSocket())
  const { selectedConversation } = useChatStore()
  const currentUser = useUserStore(s => s.user)
  const { setIncomingCall, acceptCall } = useCallStore()

  const handleStartVideoCall = () => {
    const roomName = `room_${Date.now()}_${currentUser._id}`

    const callData = {
      toUserId: receiverId || selectedConversation.receiverId,
      fromUser: currentUser,
      roomName: roomName,
      callType: 'video'
    }

    socket.emit('start_call', callData)

    setIncomingCall(callData)
    acceptCall()
  }

  useEffect(() => {
    if (!socket) return

    const handleTyping = (data) => {
      if (data.conversationId === selectedConversation?._id) {
        setTyper(data.isTyping ? data.userId : null)
      }
    }

    socket.on('display_typing', handleTyping)

    return () => socket.off('display_typing', handleTyping)
  }, [socket, selectedConversation?._id])

  return (
    <div className="
      h-14 px-4
      flex items-center justify-between
    ">
      <div className="flex items-center gap-3 max-md:ml-14">
        <img src={selectedConversation?.profilePicture} className='w-8 h-8 rounded-full' alt="" />
        <span className="font-medium">{ selectedConversation?.username }</span>
      </div>

      {/* <div>
        {typer && <p className="text-sm italic text-gray-500">{typer} đang gõ...</p>}
      </div> */}

      <div className="flex gap-2">
        <button className="p-2 rounded-full hover:bg-accent">
          <Phone size={18}/>
        </button>
        <button onClick={handleStartVideoCall} className="p-2 rounded-full hover:bg-accent">
          <Video size={18}/>
        </button>
      </div>
    </div>
  )
}


export default ChatHeader
