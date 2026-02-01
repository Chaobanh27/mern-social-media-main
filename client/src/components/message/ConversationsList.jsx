const ConversationsList = ({ setActiveIndex }) => {
  return (
    <div className="h-full flex flex-col">

      <div className="p-4 h-14 border-b font-semibold">
        Messages
      </div>

      <div className="flex-1 overflow-y-auto">
        {[...Array(20)].map((_, i) => (
          <button onClick={() => setActiveIndex(i)} key={i} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg">
            <div className="w-10 h-10 rounded-full bg-gray-300" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Username</p>
              <p className="text-xs text-gray-500 truncate">
                  Last message preview...
              </p>
            </div>
          </button>
        ))}
      </div>

    </div>
  )
}


export default ConversationsList
