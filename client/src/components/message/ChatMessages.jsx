import { useGetMessagesByConversationId } from '~/hooks/TanstackQuery'
import MessageItem from './MessageItem'
import { useChatStore } from '~/zustand/useChatStore'
import { useUserStore } from '~/zustand/userStore'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { ArrowDown } from 'lucide-react'

const ChatMessages = () => {
  const currentUser = useUserStore(s => s.user)
  const { selectedConversation } = useChatStore()
  const limit = 20
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetMessagesByConversationId(selectedConversation._id, limit)
  const virtuosoRef = useRef(null)
  // const [showButton, setShowButton] = useState(false)
  // Chuyển pages thành một mảng phẳng và đảo ngược để hiển thị từ cũ đến mới
  const messages = useMemo(() => {
    return data?.pages
      .flatMap(p => p.data)
      .reverse() || []
  }, [data])

  const START_INDEX = 10000
  const firstItemIndex = START_INDEX - messages.length

  // const scrollToBottom = useCallback(() => {
  //   virtuosoRef.current?.scrollToIndex({
  //     index: messages.length - 1,
  //     align: 'end',
  //     behavior: 'smooth'
  //   })
  // }, [messages.length])
  // const handleAtBottomChange = useCallback((atBottom) => {
  //   setShowButton(!atBottom)
  // }, [])

  // Tối ưu components để không tạo mới mỗi lần render

  const handleStartReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])


  const renderItemContent = useCallback((index, m) => (
    <div className="pb-4 px-4">
      <MessageItem
        message={m}
        isOwn={currentUser._id === m?.sender?._id}
      />
    </div>
  ), [currentUser._id])


  const components = useMemo(() => ({
    Header: () => isFetchingNextPage
      ? <div className="p-4 text-center text-xs">Đang tải tin nhắn cũ...</div>
      : <div className="h-10" />,
    Footer: () => <div className="h-4" />
  }), [isFetchingNextPage])

  return (
    <div className="
    h-[calc(100svh-224px)]
    md:h-[calc(100svh-168px)]
      bg-bg
      relative
    ">
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: '100%' }}
        data={messages}
        skipAnimationFrameInResizeObserver={true}
        defaultItemHeight={80}
        firstItemIndex={firstItemIndex}
        initialTopMostItemIndex={messages.length - 1}
        startReached={handleStartReached}
        computeItemKey={(index, item) => item._id}
        // atBottomStateChange={handleAtBottomChange}
        followOutput={(isAtBottom) => isAtBottom ? 'auto' : false}
        components={components}
        itemContent={renderItemContent}
      />

      {/* {showButton && messages.length > 0 && (
        <div className='absolute bottom-6 right-1/2 left-1/2'>
          <button
            onClick={scrollToBottom}
            className=" p-3 bg-accent text-white rounded-full shadow-lg
                     hover:bg-accent-hover transition-all animate-bounce flex items-center justify-center z-10"
          >
            <ArrowDown size={20} />

            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </button>
        </div>
      )} */}
    </div>
  )
}

export default ChatMessages
