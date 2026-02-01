import { useState } from 'react'
import FloatingChatButton from './FloatingChatButton'
import ChatListView from './ChatListView'
import ChatWindowView from './ChatWindowView'

const FloatingChatContainer = () => {
  const [open, setOpen] = useState(false)
  const [activeChat, setActiveChat] = useState(null)

  return (
    <>
      {/* Floating Button */}
      <FloatingChatButton
        onClick={() => setOpen(prev => !prev)}
      />

      {/* Chat List */}
      {open && (
        <div className="
          fixed bottom-6 right-24 z-50
          w-80 h-105
          bg-bg
          shadow-xl border
          flex flex-col
        ">
          {activeChat ? (
            <ChatWindowView
              user={activeChat}
              onBack={() => setActiveChat(null)}
            />
          ) : (
            <ChatListView
              onSelect={(user) => setActiveChat(user)}
            />
          )}
        </div>
      )}
    </>
  )
}

export default FloatingChatContainer
