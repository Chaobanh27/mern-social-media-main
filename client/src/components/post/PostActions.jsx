import { MessageSquare, Repeat, SmilePlus } from 'lucide-react'
import { Link } from 'react-router-dom'

const PostActions = ({ postId }) => {
  const checkPath = location.pathname.includes('detail')

  if (checkPath) {
    return (
      <div className="border-t h-11.25 border-border/50 text-sm px-4 py-2 flex justify-between">
        <div className='card-action-btn'>
          <SmilePlus size={18}/> 12
        </div>
        <div className='card-action-btn'>
          <MessageSquare size={18}/> 12
        </div>
        <div className='card-action-btn'>
          <Repeat size={18} /> 12
        </div>
      </div>
    )
  }
  return (
    <div className="border-t h-11.25 border-border/50 text-sm px-4 py-2 flex justify-between">
      <button className='card-action-btn'>
        <SmilePlus size={18}/> 12
      </button>
      <Link to={`/detail/${postId}`} className='card-action-btn'>
        <MessageSquare size={18}/> 12
      </Link>
      <button className='card-action-btn'>
        <Repeat size={18} /> 12
      </button>
    </div>
  )
}

export default PostActions
