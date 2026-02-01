import { useState } from 'react'
import ProfileHeader from '~/components/profile/ProfileHeader'
import ProfilePosts from '~/components/profile/ProfilePosts'
import ProfileTabs from '~/components/profile/ProfileTabs'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('Posts')

  return (
    <div className="max-w-275 mx-auto">
      <ProfileHeader />
      <ProfileTabs setActiveTab={setActiveTab} />
      {
        activeTab === 'Posts' && <ProfilePosts />
      }
      {
        activeTab === 'Reels' && <>Reels</>
      }
      {
        activeTab === 'Media' && <>Media</>
      }
      {
        activeTab === 'About' && <>About</>
      }
    </div>
  )
}

export default Profile
