import { useCheckConversation } from '~/hooks/TanstackQuery'
import ProfileStats from './ProfileStats'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '~/zustand/userStore'

const ProfileHeader = ({ data, userId }) => {
  const navigate = useNavigate()
  const currentUser = useUserStore(s => s.user)

  const checkConversation = useCheckConversation()

  const handleConversation = () => {
    checkConversation.mutate({ receiverId: data?._id }, {
      onSuccess: (res) => {
        const { hasConversation, conversation } = res
        if (hasConversation) {
          navigate(`/conversation/${conversation?._id}`)
          return
        }
        navigate(`/conversation/new/${data?._id}`, { state: { user: data } })
      }
    })
  }

  return (
    <div className="bg-bg-alt overflow-hidden border mb-4">

      {/* Cover */}
      <div className="h-48 sm:h-64 bg-bg relative">
        <img src={data?.coverPhoto} className='w-full h-full' alt="" />
        <button className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded">
          Edit cover
        </button>
      </div>

      {/* Info */}
      <div className="px-4 pb-4 relative">

        {/* Avatar */}
        <div className="absolute -top-16 left-4">
          <img alt='' src={data?.profilePicture} className="w-32 h-32 rounded-full"/>
        </div>

        <div className="pt-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* User info */}
          <div>
            <h2 className="text-xl font-bold">{data?.fullName}</h2>
            <p className="text-sm text-gray-500">{data?.username}</p>
            <p className="text-sm mt-1">
              {data?.bio}
            </p>
            <ProfileStats />
          </div>

          {/* Actions */}
          {
            (currentUser._id !== userId) && (
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Follow
                </button>
                <button onClick={handleConversation} className="px-4 py-2 border rounded-lg">
              Message
                </button>
              </div>
            )
          }


        </div>
      </div>

    </div>
  )
}

export default ProfileHeader
