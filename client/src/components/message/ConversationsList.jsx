import { PlusCircle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Virtuoso } from 'react-virtuoso'
import { useChatStore } from '~/zustand/useChatStore'

const ConversationsList = ({ conversations, loadMore, isFetchingNextPage, setShowModal }) => {

  const { selectedConversation, setSelectedConversation } = useChatStore()

  return (
    <div className="h-full flex flex-col overflow-y-auto">

      <div className="p-4 h-14 bg-accent text-primary-text font-semibold flex justify-between ">
        Messages
        <div>
          <button onClick={() => setShowModal(true)}>
            <PlusCircle/>
          </button>
        </div>
      </div>

      <div className="max-md:h-[calc(100svh-168px)] h-full overflow-y-auto  ">
        <Virtuoso
          style={{ height: '100%' }}
          data={conversations}
          endReached={loadMore}
          skipAnimationFrameInResizeObserver={true}
          increaseViewportBy={300}

          components={{
            Footer: () => isFetchingNextPage && (
              <div className="p-4 text-center text-xs text-primary">
                Đang tải thêm...
              </div>
            )
          }}

          itemContent={(index, u) => (
            <NavLink
              to={`/conversation/${u._id}`}
              onClick={() => setSelectedConversation(u)}
              key={u._id}
              // FIX CỨNG HEIGHT: Giúp Virtuoso đo đạc chuẩn
              className={({ isActive }) =>
                `w-full h-16 flex items-center gap-3 px-4 py-3 hover:bg-bg ${isActive || (selectedConversation && u._id === selectedConversation._id) ? 'bg-bg' : ''}`
              }
            >
              <img
                src={u.profilePicture}
                className="w-10 h-10 rounded-full bg-gray-300 shrink-0"
                alt=""
              />
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-sm font-medium line-clamp-1">{u.username}</p>
                  <p className="text-xs text-primary line-clamp-1 opacity-70">
                    {u?.lastMessage?.content || 'Chưa có tin nhắn'}
                  </p>
                </div>
                {
                  u?.unreadCount > 0 ?
                    <div className='w-7 h-7 text-sm bg-accent text-center py-1 rounded-full'>{u?.unreadCount}</div>
                    : null
                }
              </div>
            </NavLink>
          )}
        />
      </div>

    </div>
  )
}


export default ConversationsList
