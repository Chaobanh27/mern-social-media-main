import MessageItem from './MessageItem'

const ChatMessages = () => {
  return (
    <div className="
      flex-1 overflow-y-auto
      p-4 space-y-3
      bg-bg
    ">
      <MessageItem />
      <MessageItem isOwn />
      <MessageItem />
      <MessageItem isOwn />
    </div>
  )
}

export default ChatMessages
