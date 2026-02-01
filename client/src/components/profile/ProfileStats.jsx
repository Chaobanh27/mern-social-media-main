const ProfileStats = () => {
  return (
    <div className="flex gap-6 mt-3 text-sm">
      <Stat label="Posts" value="128" />
      <Stat label="Followers" value="12.4k" />
      <Stat label="Following" value="321" />
    </div>
  )
}

const Stat = ({ label, value }) => (
  <div>
    <span className="font-semibold">{value}</span>{' '}
    <span className="text-gray-500">{label}</span>
  </div>
)

export default ProfileStats
