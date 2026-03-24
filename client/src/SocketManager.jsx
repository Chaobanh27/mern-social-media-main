import { useQueryClient } from '@tanstack/react-query'
import { useSocketStore } from './zustand/useSocketStore'
import { useEffect } from 'react'
import { handleIncomingConversation, handleIncomingMessage, handleIncomingReaction } from './services/socketServices'
import { useUserStore } from './zustand/userStore'

const SocketManager = () => {
  const socket = useSocketStore(s => s.getSocket())
  const queryClient = useQueryClient()
  const currentUser = useUserStore(s => s.user)

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (newMessage) => {
      handleIncomingMessage(newMessage, queryClient, currentUser)
    }

    const handleNewConversation = (newConversation) => {
      handleIncomingConversation(newConversation, queryClient, currentUser)
    }

    const handleNewReaction = (newReaction) => {
      handleIncomingReaction(newReaction, queryClient)
    }

    socket.on('new_conversation', handleNewConversation)

    socket.on('new_message', handleNewMessage)

    socket.on('message_reaction', handleNewReaction )

    socket.on('added_to_group', (data) => {
      console.log('data from socket: ', data)
    })

    return () => {
      socket.off('new_conversation')
      socket.off('new_message')
      socket.off('added_to_group')
      socket.off('message_reaction')
    }
  }, [socket, queryClient, currentUser])

  return null
}

export default SocketManager