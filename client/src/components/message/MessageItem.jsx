const MessageItem = ({ isOwn }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[70%]
          px-3 py-2 rounded-xl text-sm
          ${isOwn
      ? 'bg-accent text-white rounded-br-none'
      : 'bg-bg-card border rounded-bl-none'}
        `}
      >
        This is a message content
      </div>
    </div>
  )
}

export default MessageItem
