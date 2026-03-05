import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const PostContent = ({ post, showMore, setShowMore, renderMediaGallery }) => {

  // Helper function để gộp class Tailwind
  const cn = (...inputs) => {
    return twMerge(clsx(inputs))
  }

  return (
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
        {renderMediaGallery}
      </div>
    </div>
  )
}

export default PostContent
