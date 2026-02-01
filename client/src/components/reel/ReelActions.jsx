import { Heart, MessageCircle, Share2 } from 'lucide-react'

const Action = ({ icon: Icon, count }) => (
  <button className="flex flex-col items-center text-white mb-4">
    <Icon size={26} />
    <span className="text-xs mt-1">{count}</span>
  </button>
)

const ReelActions = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-gray-300 mb-4" />
      <Action icon={Heart} count="1.2k" />
      <Action icon={MessageCircle} count="234" />
      <Action icon={Share2} count="88" />
    </div>
  )
}

export default ReelActions
