import { useState } from 'react'
import { useParams } from 'react-router-dom'
import ProfileHeader from '~/components/profile/ProfileHeader'
import ProfilePosts from '~/components/profile/ProfilePosts'
import ProfileTabs from '~/components/profile/ProfileTabs'
import { useGetUserById } from '~/hooks/TanstackQuery'

const Profile = () => {
  const { userId } = useParams()
  const { data } = useGetUserById(userId)
  const [activeTab, setActiveTab] = useState('Posts')

  return (
    <div className="max-w-275 mx-auto">
      <ProfileHeader data={data && data} />
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
