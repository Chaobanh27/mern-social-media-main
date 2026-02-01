const ProfilePosts = () => {
  return (
    <div className="
      grid grid-cols-2 sm:grid-cols-3
      gap-2 sm:gap-4
    ">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="aspect-square bg-bg-alt rounded-lg relative group">

          {/* Hover overlay */}
          <div className="
      absolute inset-0 bg-black/40
      opacity-0 group-hover:opacity-100
      transition
      flex items-center justify-center
      text-white text-sm
    ">
      View
          </div>

        </div>
      ))}
    </div>
  )
}


export default ProfilePosts
