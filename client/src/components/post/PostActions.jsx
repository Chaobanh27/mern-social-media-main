import { MessageSquare, Repeat, SmilePlus } from 'lucide-react'

const PostActions = () => {
  return (
    <div className="border-t border-border text-sm px-4 py-2 flex justify-between ">
      <div className='flex gap-2 py-0.5 px-2'>
        <SmilePlus size={19}/> 12
      </div>
      <div className='flex gap-2 py-0.5 px-2'>
        <MessageSquare size={19}/> 12
      </div>
      <div className='flex gap-2 py-0.5 px-2'>
        <Repeat size={19} /> 12
      </div>
    </div>
  )
}

export default PostActions
