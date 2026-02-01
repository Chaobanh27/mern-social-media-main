import ProfileStats from './ProfileStats'

const ProfileHeader = () => {
  return (
    <div className="bg-bg-alt overflow-hidden border mb-4">

      {/* Cover */}
      <div className="h-48 sm:h-64 bg-bg relative">
        <button className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded">
          Edit cover
        </button>
      </div>

      {/* Info */}
      <div className="px-4 pb-4 relative">

        {/* Avatar */}
        <div className="absolute -top-16 left-4">
          <img alt='' src='https://picsum.photos/200/300' className="w-32 h-32 rounded-full"/>
        </div>

        <div className="pt-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* User info */}
          <div>
            <h2 className="text-xl font-bold">Username</h2>
            <p className="text-sm text-gray-500">@username</p>
            <p className="text-sm mt-1">
              Frontend Developer | React • Tailwind • MERN 🚀
            </p>
            <ProfileStats />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Follow
            </button>
            <button className="px-4 py-2 border rounded-lg">
              Message
            </button>
          </div>

        </div>
      </div>

    </div>
  )
}

export default ProfileHeader
