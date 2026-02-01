import { MessageSquare, Repeat, SmilePlus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ImageModal from './ImageModal'

const post = {
  user: {
    name: 'Username',
    avatar: 'https://picsum.photos/200/300'
  },
  time: '2 hours ago',
  content:  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum',
  images: [
    'https://picsum.photos/600/400?1',
    'https://picsum.photos/600/400?2',
    'https://picsum.photos/600/400?3',
    'https://picsum.photos/600/400?4',
    'https://picsum.photos/600/400?5'
  ],
  likes: 12,
  comments: 5,
  shares: 3
}


const PostCard = () => {
  const [showMore, setShowMore] = useState(false)
  const [activeImage, setActiveImage] = useState(null)

  const images = post.images || []

  const renderImages = () => {
    const count = images.length

    if (count === 1) {
      return (
        <img
          src={images[0]}
          alt=''
          onClick={() => setActiveImage(0)}
          className="w-full aspect-3/2 object-cover rounded-lg cursor-pointer" />
      )
    }

    else if (count === 2) {
      return (
        <div className='grid grid-cols-2 gap-1'>
          {
            images.map((img, i) => (
              <img
                onClick={() => setActiveImage(i)}
                key={i}
                src={img}
                alt=''
                className="w-full object-cover rounded-lg cursor-pointer" />
            ))
          }
        </div>
      )
    }

    else if (count === 3) {
      return (
        <div className='grid grid-cols-3 gap-1'>
          {
            images.map((img, i) => (
              <img
                onClick={() => setActiveImage(i)}
                key={i}
                src={img}
                alt=''
                className="w-full object-cover rounded-lg cursor-pointer" />
            ))
          }
        </div>
      )
    }

    else if (count === 4) {
      return (
        <div className='grid grid-cols-2 gap-1'>
          {
            images.map((img, i) => (
              <img
                onClick={() => setActiveImage(i)}
                key={i}
                src={img}
                alt='' className="w-full object-cover rounded-lg cursor-pointer" />
            ))
          }
        </div>
      )
    }

    else if (count > 4) {
      return (
        <div className='grid grid-cols-2 gap-1'>
          {
            images.slice(0, 3).map((img, i) => (
              <img
                onClick={() => setActiveImage(i)}
                key={i}
                src={img}
                alt=''
                className="w-full object-cover rounded-lg cursor-pointer" />
            ))
          }
          <div className='relative'>
            <img
              src={images[3]}
              alt=""
              className='w-full object-cover rounded-lg cursor-pointe'
            />
            <div
              onClick={() => setActiveImage(3)}
              className='absolute w-full text-primary-text h-full top-0 bg-black/50 flex justify-center items-center text-5xl cursor-pointer'>
            +{count - 4}
            </div>
          </div>
        </div>
      )
    }
  }


  return (
    <div className="bg-bg-alt transition-slow rounded-xl shadow-sm ">

      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <img src="https://picsum.photos/200/300" alt='' className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="text-sm font-semibold">Username</p>
          <p className="text-xs text-gray-500">2 hours ago</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-2">
        <p
          className={`
          whitespace-pre-line 
          ${!showMore ? 'line-clamp-3' : ''}
        `}
        >
          {post?.content}
        </p>

        {post?.content.length > 150 && (
          <button
            className="text-xs  font-semibold mt-1"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? 'See less' : 'See more'}
          </button>
        )}
        {images.length > 0 && (
          <div className="mt-2 rounded-lg overflow-hidden">
            {renderImages()}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-border text-sm px-4 py-2 flex justify-between ">
        <button className='flex gap-2 py-0.5 px-2'>
          <SmilePlus size={19}/> 12
        </button>
        <Link to={'/detail'} className='flex gap-2 py-0.5 px-2'>
          <MessageSquare size={19}/> 12
        </Link>
        <button className='flex gap-2 py-0.5 px-2'>
          <Repeat size={19} /> 12
        </button>
      </div>

      <ImageModal
        images={images}
        activeImage={activeImage}
        onClose={() => setActiveImage(null)}
      />

    </div>
  )
}

export default PostCard
