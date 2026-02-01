import { useState } from 'react'

const heights = [
  'h-40', 'h-52', 'h-64', 'h-80', 'h-96'
]

const ExploreItem = () => {
  const [randomHeight] = useState(() => heights[Math.floor(Math.random() * heights.length)])

  return (
    <div className="mb-3 break-inside-avoid">
      <div
        className={`
          w-full ${randomHeight}
          bg-gray-300 rounded-xl
          overflow-hidden relative
          group cursor-pointer
        `}
      >
        {/* Media */}
        <div className="w-full h-full bg-gray-400" />

        {/* Overlay */}
        <div
          className="
            absolute inset-0 bg-black/40
            opacity-0 group-hover:opacity-100
            transition
            flex items-center justify-center
            text-white text-sm
          "
        >
          View
        </div>
      </div>

      {/* Meta */}
      <div className="mt-1 px-1 text-sm">
        <p className="font-medium truncate">Post title</p>
        <p className="text-xs text-gray-500">by user</p>
      </div>
    </div>
  )
}

export default ExploreItem
