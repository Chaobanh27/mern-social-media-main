import { useEffect } from 'react'
import { useWatch } from 'react-hook-form'
import { useChatStore } from '~/zustand/useChatStore'
import { useUserStore } from '~/zustand/userStore'
import { useSocketStore } from '~/zustand/useSocketStore'

const TypingIndicator = ({ control, isTypingRef, typingTimeOutRef}) => {
  const socket = useSocketStore(s => s.getSocket())
  const currentUser = useUserStore(s => s.user)
  const { selectedConversation } = useChatStore()
  const conversationId = selectedConversation?._id

  const message = useWatch({
    control,
    name: 'message'
  })

  useEffect(() => {
    // 1. Kiểm tra điều kiện cần
    if (!socket || !conversationId || !currentUser) return

    // 2. Nếu tin nhắn rỗng, có thể gửi stop ngay lập tức (tùy UX)
    if (!message) {
      if (isTypingRef.current) {
        socket.emit('typing_stop', { conversationId })
        isTypingRef.current = false
      }
      return
    }

    // 3. Gửi sự kiện bắt đầu gõ (chỉ gửi lần đầu)
    if (!isTypingRef.current) {
      isTypingRef.current = true
      socket.emit('typing_start', { conversationId, userId: currentUser._id })
    }

    // 4. Debounce để gửi sự kiện dừng gõ
    if (typingTimeOutRef.current) clearTimeout(typingTimeOutRef.current)

    typingTimeOutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId })
      isTypingRef.current = false
    }, 3000)

    // 5. Cleanup function: Cực kỳ quan trọng
    // Nếu component unmount hoặc đổi conversation, phải xóa timeout
    return () => {
      if (typingTimeOutRef.current) clearTimeout(typingTimeOutRef.current)
    }
  }, [message, conversationId, currentUser?.username, socket]) // Chỉ tập trung vào những thứ thực sự thay đổi

  return null // Component này chỉ xử lý logic, trả về null để nhẹ DOM
}

export default TypingIndicator