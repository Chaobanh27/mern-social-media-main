const ProfileReels = () => {
  return (
    <div className="
      grid grid-cols-2 sm:grid-cols-3
      gap-2
    ">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="aspect-9/16 bg-black rounded-lg"
        />
      ))}
    </div>
  )
}

export default ProfileReels
