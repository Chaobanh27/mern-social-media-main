import { memo, useState, useMemo, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import VideoJS from '../videojs/VideoJs'
import MediaModal from './MediaModal'
import PostContent from './PostContent'
import PostHeader from './PostHeader'
import PostActions from './PostActions'

const PostCard = memo(function PostCard({ post }) {
  const [showMore, setShowMore] = useState(false)
  const [activeImage, setActiveImage] = useState(null)

  const media = post?.media || []
  const count = media.length
  const postId = post?._id

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

    return (
      <div className="relative w-full aspect-video overflow-hidden ">
        {item.type === 'video' ? (
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
        ) : (
          <img
            key={item._id}
            src={item.url}
            alt=''
            onClick={() => setActiveImage(item._id)}
            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
          // Lưu ý: 'object-cover' sẽ lấp đầy div, 'object-contain' sẽ hiện toàn bộ ảnh (có khoảng đen)
          />
        )}
      </div>
    )
  }, [videoJsOptions, setActiveImage])

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
      <PostHeader post={post}/>

      {/* Content */}
      <PostContent post={post} showMore={showMore} setShowMore={setShowMore} renderMediaGallery={renderMediaGallery()} />

      {/* Actions */}
      <PostActions postId = {postId}/>

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