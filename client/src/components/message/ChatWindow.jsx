import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'

const ChatWindow = () => {
  return (
    <div className="h-full flex flex-col">
      <ChatHeader />
      <ChatMessages />
      <ChatInput />
    </div>
  )
}

export default ChatWindow
