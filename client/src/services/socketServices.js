

export const handleIncomingConversation = (newConversation, queryClient) => {
  // eslint-disable-next-line no-console
  console.log('newConversation:', newConversation)
  const queryKey = ['conversations']
  queryClient.setQueryData(queryKey, oldData => {
    if (!oldData) return oldData

    return {
      ...oldData,
      pages: [
        {
          ...oldData.pages[0],
          data: [newConversation, ...oldData.pages[0].data]
        },
        //Bởi bì phân trang dựa trên cursor nên trong mảng pages sẽ chứa nhiều obj có mảng data
        //Lấy tất cả phần tử từ index 1 đến hết mảng
        ...oldData.pages.slice(1)
      ]
    }
  })
}

export const handleIncomingMessage = (newMessage, queryClient, currentUser) => {
  const conversationId = newMessage.conversation
  const isMine = newMessage.sender._id === currentUser._id

  queryClient.setQueryData(['messages', conversationId], oldData => {
    if (!oldData) return oldData

    const isMessageExists = oldData.pages.some(p =>
      p.data.some(m => m._id === newMessage._id)
    )

    if (isMessageExists) return oldData

    const newPages = [...oldData.pages]

    newPages[0] = {
      ...newPages[0],
      data: [newMessage, ...newPages[0].data]
    }
    return { ...oldData, pages: newPages }
  })

  /*
  1. kiểm tra oldData nếu không thì trả về undefined
  2. nếu có thì tạo biến targetConversation để copy dữ liện
  3. duyệt qua tất cả conversations và tìm conversation nào trùng với _id của
  conversationId trong newMessage
  4. nếu thấy thì dùng biến tảgetConversation để chứa dữ liệu của conversation đó
  và cập nhật lastMessage và updatedAt của conversation đó (return false)
  5. nếu không có thì trả về nguyên danh sách conversation cũ (return true)
  6. nếu biến targetConversation vẫn là null thì chứng tỏ conversation trong newMesage là mới
  và chúng ta sẽ trả về dữ liệu oldData
  6. nếu biến targetConversation chứa obj copy lúc trước thì hàm đó dã có sẵn trong danh sách
  và chúng ta chỉ cần trả về dữ liệu danh sách đó với targetConversation ở đầu danh sách
   */

  queryClient.setQueryData(['conversations'], (oldData) => {
    if (!oldData) return oldData

    let targetConversation = null

    const cleanPages = oldData.pages.map(page => {
      const filteredData = page.data.filter(c => {
        if (c._id === conversationId) {
          targetConversation = {
            ...c,
            unreadCount: isMine ? c.unreadCount : (c.unreadCount + 1),
            lastMessage: newMessage,
            updatedAt: newMessage.createdAt || new Date().toISOString()
          }
          return false
        }
        return true
      })
      return { ...page, data: filteredData }
    })


    if (!targetConversation) return oldData

    const newPages = [...cleanPages]
    newPages[0] = {
      ...newPages[0],
      data: [targetConversation, ...newPages[0].data]
    }

    return { ...oldData, pages: newPages }
  })
}

export const handleIncomingReaction = (newReaction, queryClient) => {
  const { targetId, data, conversationId } = newReaction
  const newSummary = data.reactionSummary

  queryClient.setQueryData(['messages', conversationId], oldData => {
    if (!oldData) return oldData

    return {
      ...oldData,
      pages: oldData.pages.map((page) => ({
        ...page,
        data: page.data.map(msg => {
          if (msg._id === targetId) {
            return { ...msg, reactionSummary: newSummary }
          }
          return msg
        })
      }))
    }
  })
}