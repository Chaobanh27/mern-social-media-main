import { useState } from 'react'
import { useParams } from 'react-router-dom'
import ProfileHeader from '~/components/profile/ProfileHeader'
import ProfileMedia from '~/components/profile/ProfileMedia'
import ProfilePosts from '~/components/profile/ProfilePosts'
import ProfileTabs from '~/components/profile/ProfileTabs'
import { useGetUserById } from '~/hooks/TanstackQuery'

const Profile = () => {
  const { userId } = useParams()
  const { data, isLoading, isError, error } = useGetUserById(userId)
  const [activeTab, setActiveTab] = useState('Posts')

  // Trạng thái đang tải (Loading)
  if (isLoading) return <div>Đang tải dữ liệu...</div>

  // Trạng thái lỗi (Error)
  if (isError) return <div>Đã xảy ra lỗi: {error.message}</div>

  // Trạng thái không có dữ liệu (Empty)
  if (!data) return <div>Không tìm thấy người dùng này!</div>

  return (
    <div className="max-w-275 mx-auto">
      <ProfileHeader data={data} userId = {userId} />
      <ProfileTabs setActiveTab={setActiveTab} />
      {
        activeTab === 'Posts' && <ProfilePosts userId={userId} />
      }
      {
        activeTab === 'Reels' && <>Reels</>
      }
      {
        activeTab === 'Media' && <ProfileMedia />
      }
      {
        activeTab === 'About' && <>About</>
      }
    </div>
  )
}

export default Profile
