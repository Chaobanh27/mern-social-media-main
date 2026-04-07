import { PhoneForwarded, Video } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useCallStore } from '~/zustand/useCallStore'
import { useChatStore } from '~/zustand/useChatStore'
import { useUserStore } from '~/zustand/userStore'
import { useSocketStore } from '~/zustand/useSocketStore'

const ChatHeader = ({ receiverId }) => {
  const [typer, setTyper] = useState(null)
  const socket = useSocketStore(s => s.getSocket())
  const { selectedConversation } = useChatStore()
  const currentUser = useUserStore(s => s.user)
  const { setIncomingCall, acceptCall, activeGroupCalls, isCalling, isIncoming } = useCallStore()

  const isUserBusy = isCalling || isIncoming

  const activeCallInGroup = useMemo(() => {
    return activeGroupCalls.find(call => call.conversationId === selectedConversation?._id)
  }, [activeGroupCalls, selectedConversation?._id])

  const handleVideoCall = () => {
    if (isUserBusy) {
      toast.error('You are already in another call!')
      return
    }
    if (activeCallInGroup) {
      const joinData = {
        ...activeCallInGroup,
        fromUser: currentUser
      }
      setIncomingCall(joinData)
      acceptCall()
    } else {
      const roomName = `room_${Date.now()}_${currentUser._id}`
      const callData = {
        toUserId: selectedConversation.type !== 'group' ? (receiverId || selectedConversation.receiverId) : null,
        conversationId: selectedConversation._id,
        fromUser: currentUser,
        roomName: roomName,
        callType: 'video',
        isGroup: selectedConversation.type === 'group' ? true : false
      }

      socket.emit('start_call', callData)

      setIncomingCall(callData)
      acceptCall()
    }


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
    <div className="h-14 px-4 flex items-center justify-between ">
      <div className="flex items-center gap-3 max-md:ml-14">
        <img src={selectedConversation?.profilePicture} className='w-8 h-8 rounded-full border ' alt="" />
        <div className="flex flex-col">
          <span className="font-medium text-slate-200">{selectedConversation?.username}</span>
          {activeCallInGroup && !isUserBusy && (
            <span className="text-[10px] text-green-500 animate-pulse font-bold uppercase">
              The call is in progress
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleVideoCall}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full transition-all
            ${activeCallInGroup && !isUserBusy
      ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20'
      : 'hover:bg-slate-800 text-slate-300'}
          `}
        >
          {activeCallInGroup && !isUserBusy ? (
            <>
              <PhoneForwarded size={18} />
              <span className="text-xs font-bold">JOIN</span>
            </>
          ) : (
            <Video size={20} />
          )}
        </button>
      </div>
    </div>
  )
}


export default ChatHeader
