import { ArrowLeft, MessageSquareMore } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ChatWindow from '~/components/message/ChatWindow'
import ConversationsList from '~/components/message/ConversationsList'
import { useChatStore } from '~/zustand/useChatStore'
import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import CreateGroupModal from '~/components/message/CreateGroupModal'
import { useGetConversations, useMarkAsRead } from '~/hooks/TanstackQuery'

const Conversation = () => {
  const [showModal, setShowModal] = useState(false)
  const location = useLocation()
  const { conversationId, receiverId } = useParams()
  const { selectedConversation, setSelectedConversation, tempConversation, setTempConversation } = useChatStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const limit = 15
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetConversations(limit)

  const conversations = useMemo(() => {
    const realList = data?.pages.flatMap(p => p.data) || []

    // Nếu có tempConversation và nó CHƯA tồn tại trong danh sách thật
    if (tempConversation && !realList.find(c => c.receiverId === tempConversation.receiverId)) {
      return [tempConversation, ...realList]
    }

    return realList
  }, [data, tempConversation])

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }
  const markAsRead = useMarkAsRead()

  useEffect(() => {
    if (receiverId) {
      const userFromState = location.state?.user
      // Kiểm tra xem đã có conversation nào là isTemp chưa để tránh add trùng
      const currentData = queryClient.getQueryData(['conversations'])
      const isAlreadyAdded = currentData?.pages.some(p =>
        p.data.some(c => c.isTemp && c.receiverId === receiverId)
      )

      if (isAlreadyAdded) return


      const mockConv = {
        _id: `temp_${receiverId}`,
        receiverId: receiverId,
        type: 'private',
        username: userFromState?.username,
        profilePicture: userFromState?.profilePicture,
        lastMessage: null,
        unreadCount: 0,
        isTemp: true
      }

      setTempConversation(mockConv)
      setSelectedConversation(mockConv)
      queryClient.setQueryData(['conversations'], (oldData) => {
        if (!oldData) return oldData
        const newPages = oldData.pages.map((p, i) => {
          if (i === 0) {
            return { ...p, data: [mockConv, ...p.data] }
          }
          return p
        })

        return { ...oldData, pages: newPages }
      })

    }
    else if (conversationId) {
      // Xử lý tìm trong list hoặc fetch từ DB
      const foundConversation = conversations.find(c => c._id === conversationId)
      if (foundConversation) {
        setSelectedConversation(foundConversation)

        if (foundConversation.unreadCount > 0) {
          markAsRead.mutate(foundConversation._id)
        }
      }
    }


  }, [receiverId, conversationId, queryClient, location.state?.user])

  useEffect(() => {
    return () => setSelectedConversation(null)
  }, [])

  return (
    <>
      <div className="
      md:h-[calc(100svh-56px)]
      bg-bg-alt
      transition-slow
      flex
    ">

        <aside
          className={`
          w-[320px] md:block 
          ${selectedConversation ? 'max-md:hidden' : 'max-md:w-full'}
        `}
        >
          <ConversationsList conversations={conversations} loadMore={loadMore} isFetchingNextPage={isFetchingNextPage} setShowModal={setShowModal} />
        </aside>

        {
          (!receiverId && !conversationId) && (
            <div className='w-[calc(100%-320px)] md:h-[calc(100svh-56px)] hidden md:block bg-bg'>
              <div className='w-full h-full flex justify-center items-center'>
                <MessageSquareMore size={150}/>
              </div>
            </div>
          )
        }

        {selectedConversation && (receiverId || conversationId) && (
          <main className="flex-1 relative">
            {/* Mobile back button */}
            <div className="md:hidden absolute top-3 left-3 z-50">
              <button
                onClick={() => {
                  navigate('/conversation')
                  setSelectedConversation(null)
                }}
                className="px-3 py-1 bg-bg-alt rounded-full border"
              >
                <ArrowLeft />
              </button>
            </div>
            <ChatWindow receiverId={receiverId} />
          </main>
        )}

        {selectedConversation && (receiverId || conversationId) && (
          <aside className="w-70 hidden lg:block p-4">
            <h4 className="text-sm font-semibold mb-2">Info</h4>
            <p className="text-sm ">Shared media</p>
          </aside>
        )}
      </div>
      <AnimatePresence>
        {showModal ? <CreateGroupModal showModal={showModal} onClose={() => setShowModal(false)}/> : null }
      </AnimatePresence>
    </>

  )
}

export default Conversation
