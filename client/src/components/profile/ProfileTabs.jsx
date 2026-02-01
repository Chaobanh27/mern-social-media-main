import { Grid, Video, Image, Info } from 'lucide-react'

const tabs = [
  { label: 'Posts', icon: Grid },
  { label: 'Reels', icon: Video },
  { label: 'Media', icon: Image },
  { label: 'About', icon: Info }
]

const ProfileTabs = ({ setActiveTab }) => {

  return (
    <div className="bg-bg-alt border mb-4">
      <div className="flex">
        {tabs.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setActiveTab(label)}
            className="
              flex-1 py-3
              flex justify-center items-center gap-2
              text-sm font-medium
              hover:bg-bg
            "
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProfileTabs
