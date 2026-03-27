import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'
import { useSocketStore } from '~/zustand/useSocketStore'
import { useEffect } from 'react'
import { useChatStore } from '~/zustand/useChatStore'

const ChatWindow = ({ receiverId }) => {
  const { selectedConversation } = useChatStore()
  const conversationId = selectedConversation._id
  const socket = useSocketStore(state => state.getSocket())

  useEffect(() => {
    if ( socket && conversationId) {
      socket.emit('join_chat', conversationId)
      return () => {
        socket.emit('leave_chat', conversationId)
      }
    }
  }, [socket, conversationId])
  return (
    <div className="h-full flex flex-col">
      <ChatHeader receiverId={receiverId}/>
      <ChatMessages />
      <ChatInput receiverId={receiverId} />
    </div>
  )
}

export default ChatWindow
