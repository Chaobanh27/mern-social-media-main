import { Search } from 'lucide-react'

const ExploreHeader = () => {
  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input
          placeholder="Search posts, users, tags..."
          className="w-full pl-9 pr-3 py-2 border rounded-full text-sm outline-none"
        />
      </div>
    </div>
  )
}

export default ExploreHeader
