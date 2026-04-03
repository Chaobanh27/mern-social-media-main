import { useQueryClient } from '@tanstack/react-query'
import { useSocketStore } from './zustand/useSocketStore'
import { useEffect } from 'react'
import { handleIncomingConversation, handleIncomingMessage, handleIncomingReaction } from './services/socketServices'
import { useUserStore } from './zustand/userStore'
import { useCallStore } from './zustand/useCallStore'
import toast from 'react-hot-toast'

const SocketManager = () => {
  const socket = useSocketStore(s => s.getSocket())
  const queryClient = useQueryClient()
  const currentUser = useUserStore(s => s.user)
  const { setIncomingCall, acceptCall, endCall, addParticipant, removeParticipant, addGroupCall, removeGroupCall } = useCallStore()

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

    socket.on('incoming_call', data => {
      if (data.isGroup) {
        addGroupCall(data)
      }
      setIncomingCall(data)
    })

    socket.on('call_accepted', () => {
      acceptCall()
    })

    socket.on('participant_joined', ({ user }) => {
      if (user._id !== currentUser._id) {
        addParticipant(user)
      }
    })

    socket.on('participant_left', ({ userId }) => {
      removeParticipant(userId)
    })

    socket.on('call_rejected', () => {
      endCall()
    })

    socket.on('call_ended', () => {
      endCall()
    })

    socket.on('group_call_cancelled', () => {
      endCall()
    })

    socket.on('group_call_finished', ({ roomName }) => {
      removeGroupCall(roomName) // Xóa khỏi danh sách active (mất nút Join)
    })

    socket.on('all_participants_rejected', () => {
      toast.success('all participants rejected')
      endCall()
    })

    return () => {
      socket.off('new_conversation')
      socket.off('new_message')
      socket.off('added_to_group')
      socket.off('message_reaction')
      socket.off('incoming_call')
      socket.off('call_accepted')
      socket.off('call_rejected')
      socket.off('call_ended')
      socket.off('participant_joined')
      socket.off('participant_left')
      socket.off('group_call_cancelled')
      socket.off('group_call_finished')
      socket.off('all_participants_rejected')
    }
  }, [socket, queryClient, currentUser, setIncomingCall, acceptCall, endCall, addParticipant, removeParticipant, addGroupCall, removeGroupCall])

  return null
}

export default SocketManager