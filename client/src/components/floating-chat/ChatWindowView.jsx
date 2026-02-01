import { ArrowLeft } from 'lucide-react'

const ChatWindowView = ({ user, onBack }) => {
  return (
    <>
      {/* Header */}
      <div className="
        h-12 px-3 border-b
        flex items-center gap-2
      ">
        <button onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-300" />
        <span className="text-sm font-medium">{user.name}</span>
      </div>

      {/* Messages */}
      <div className="
        flex-1 p-3 space-y-2
        overflow-y-auto bg-bg-alt
      ">
        <Bubble />
        <Bubble isOwn />
        <Bubble />
      </div>

      {/* Input */}
      <div className="border-t p-2">
        <input
          placeholder="Type a message..."
          className="
            w-full px-3 py-2
            border rounded-full
            outline-none text-sm
          "
        />
      </div>
    </>
  )
}

const Bubble = ({ isOwn }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`
        max-w-[75%]
        px-3 py-2 rounded-lg text-sm
        ${isOwn
    ? 'bg-blue-600 text-white'
    : 'bg-bg-alt border'}
      `}
    >
      Hello 👋
    </div>
  </div>
)

export default ChatWindowView
