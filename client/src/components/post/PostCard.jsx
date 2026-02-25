import { MessageSquare, Repeat, SmilePlus } from 'lucide-react'
import { memo, useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import VideoJS from '../videojs/VideoJs'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import MediaModal from './MediaModal'

// Helper function để gộp class Tailwind chuẩn
const cn = (...inputs) => {
  return twMerge(clsx(inputs))
}

const PostCard = memo(function PostCard({ post }) {
  const [showMore, setShowMore] = useState(false)
  const [activeImage, setActiveImage] = useState(null)

  const media = post?.media || []
  const count = media.length

  const videoJsOptions = useMemo(() => ({
    autoplay: false,
    preload:'none',
    controls: true,
    responsive: true,
    fluid: true,
    aspectRatio: '16:9'
  }), [])

  const renderMediaItem = useCallback(item => {
    if (!item) return null

    // Logic render giống như trên nhưng sạch hơn
    if (item.type === 'video') {
      return (
        <div className="w-full h-full">
          <VideoJS
            key={item._id}
            options={{
              ...videoJsOptions,
              poster: item?.metadata.thumbnailUrl,
              sources: [{ src: item.url, type: item.mimeType }]
            }}
          />
        </div>
      )
    }

    return (
      <img
        key={item._id}
        src={item.url}
        alt=''
        onClick={() => setActiveImage(item._id)}
        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
      />
    )
  }, [videoJsOptions])

  const renderMoreOverlay = () => (
    <div className='relative'>
      <img
        src={media[3]?.url}
        alt=""
        className='w-full h-full object-cover cursor-pointer'
      />
      <div
        onClick={() => setActiveImage(media[3]._id)}
        className='absolute inset-0 bg-black/50 flex justify-center items-center text-white text-3xl font-bold cursor-pointer hover:bg-black/40 transition-colors'>
              +{count - 4}
      </div>
    </div>
  )

  // const renderMediaGallery = () => {
  //   if (count === 0) return null

  //   return (
  //     <div className={cn(
  //       'grid ',
  //       {
  //         'grid-cols-1 ': count === 1,
  //         'grid-cols-2': count === 2,
  //         'grid-cols-2 ': count === 3,
  //         'grid-cols-2 grid-rows-2 ': count >= 4
  //       }
  //     )}>
  //       {
  //         count === 3 && (
  //           media[0].type === 'video' ?
  //             <div className='col-span-2'>
  //               <VideoJS
  //                 key={media[0]._id}
  //                 options={{
  //                   ...videoJsOptions,
  //                   poster: media[0]?.metadata.thumbnailUrl,
  //                   sources: [{ src: media[0].url, type: media[0].mimeType }]
  //                 }}
  //               />
  //             </div>
  //             :
  //             <img
  //               src={media[0]?.url}
  //               alt=""
  //               onClick={() => setActiveImage(media[0]._id)}
  //               className='w-full h-full col-span-2 object-cover cursor-pointer'
  //             />
  //         )
  //       }
  //       {media.slice(count === 3 ? 1 : 0, count > 4 ? 3 : 4).map(item => renderMediaItem(item))}

  //       {count > 4 && (
  //         renderMoreOverlay()
  //       )}
  //     </div>
  //   )
  // }

  const renderMediaGallery = () => {
    if (count === 0) return null

    // TRƯỜNG HỢP 1 ẢNH/VIDEO
    if (count === 1) {
      return (
        <div className="w-full">
          {renderMediaItem(media[0])}
        </div>
      )
    }

    if (count === 2) {
      return (
        <div className="grid grid-cols-2">
          {renderMediaItem(media[0])}
          {renderMediaItem(media[1])}
        </div>
      )
    }

    if (count === 3) {
      return (
        <div className="grid grid-cols-2">
          <div className="col-span-2">
            {renderMediaItem(media[0])}
          </div>
          <div>
            {renderMediaItem(media[1])}
          </div>
          <div>
            {renderMediaItem(media[2])}
          </div>
        </div>
      )
    }

    if (count === 4) {
      return (
        <div className="grid grid-cols-2 grid-rows-2">
          {media.slice(0, 4).map((item) => (
            <div key={item._id} className="h-full">
              {renderMediaItem(item)}
            </div>
          ))}
        </div>
      )
    }

    if (count > 4) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 rounded-lg overflow-hidden h-80">
          {renderMediaItem(media[0])}
          {renderMediaItem(media[1])}
          {renderMediaItem(media[2])}
          {renderMoreOverlay()}
        </div>
      )
    }

    return null
  }

  return (
    <div className="card transition-slow">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 h-18">
        <img src={post?.user?.profilePicture} alt='' className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="text-sm font-semibold">{post?.user?.username}</p>
          <p className="text-xs text-gray-500">2 hours ago</p>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-5 px-4 pb-4 space-y-2">
        <p className={cn(
          'whitespace-pre-line text-sm leading-relaxed',
          !showMore && 'line-clamp-3'
        )}>
          {post?.content}
        </p>

        {post?.content?.length > 150 && (
          <button
            className="text-xs font-bold text-blue-500 hover:underline mt-1"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? 'See less' : 'See more'}
          </button>
        )}

        <div className="mt-2 overflow-hidden  ">
          {renderMediaGallery()}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t h-11.25 border-border/50 text-sm px-4 py-2 flex justify-between">
        <button className='card-action-btn'>
          <SmilePlus size={18}/> 12
        </button>
        <Link to={'/detail'} className='card-action-btn'>
          <MessageSquare size={18}/> 12
        </Link>
        <button className='card-action-btn'>
          <Repeat size={18} /> 12
        </button>
      </div>

      <AnimatePresence>
        {activeImage !== null && (
          <MediaModal
            media={media}
            videoJsOptions={videoJsOptions}
            activeImage={activeImage}
            onClose={() => setActiveImage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
})

export default PostCard