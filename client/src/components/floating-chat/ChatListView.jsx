const ChatListView = ({ onSelect }) => {
  return (
    <>
      {/* Header */}
      <div className="h-12 px-3 border-b flex items-center font-semibold">
        Chats
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {[...Array(8)].map((_, i) => (
          <ChatItem
            key={i}
            onClick={() =>
              onSelect({ id: i, name: `User ${i + 1}` })
            }
          />
        ))}
      </div>
    </>
  )
}

const ChatItem = ({ onClick }) => (
  <button
    onClick={onClick}
    className="
      w-full flex items-center gap-3
      px-3 py-2 hover:bg-bg-alt
    "
  >
    <div className="w-9 h-9 rounded-full bg-gray-300" />
    <div className="text-left">
      <p className="text-sm font-medium">Username</p>
      <p className="text-xs text-gray-500 truncate">
        Last message preview...
      </p>
    </div>
  </button>
)

export default ChatListView
