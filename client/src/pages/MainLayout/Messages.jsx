import { ArrowLeft, MessageSquareMore } from 'lucide-react'
import { useState } from 'react'
import ChatWindow from '~/components/message/ChatWindow'
import ConversationsList from '~/components/message/ConversationsList'

const Messages = () => {
  const [activeIndex, setActiveIndex] = useState(null)
  return (
    <div className="
      md:h-[calc(100svh-56px)]
      bg-bg-alt
      transition-slow
      overflow-hidden
      flex
    ">

      <aside className="w-[320px] hidden md:block border-r">
        <ConversationsList setActiveIndex={setActiveIndex} />
      </aside>

      {
        activeIndex === null && (
          <div className='w-[calc(100%-320px)] md:h-[calc(100svh-56px)] hidden md:block bg-bg'>
            <div className='w-full h-full flex justify-center items-center'>
              <MessageSquareMore size={150}/>
            </div>
          </div>
        )
      }


      {activeIndex === null && (
        <div className="flex-1 md:hidden">
          <ConversationsList setActiveIndex={setActiveIndex} />
        </div>
      )}

      {(activeIndex !== null) && (
        <main className="flex-1 relative">
          {/* Mobile back button */}
          <div className="md:hidden absolute top-3 left-3 z-50">
            <button
              className="px-3 py-1 bg-bg-alt rounded-full border"
              onClick={() => setActiveIndex(null)}
            >
              <ArrowLeft />
            </button>
          </div>
          <ChatWindow />
        </main>
      )}

      {(activeIndex !== null) && (
        <aside className="w-70 hidden lg:block border-l p-4">
          <h4 className="text-sm font-semibold mb-2">Info</h4>
          <p className="text-sm text-gray-500">Shared media</p>
        </aside>
      )}


    </div>
  )
}

export default Messages
