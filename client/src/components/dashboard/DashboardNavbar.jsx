import { SignedIn, UserButton } from '@clerk/clerk-react'
import { MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import NotificationBell from '../notification/NotificationBell'
import ThemeSelector from '../theme/ThemeSelector'


const DashboardNavbar = () => {

  return (
    <div className="h-full px-4 flex items-center justify-between">
      {/* Logo */}
      <Link to='/' className="font-bold text-xl">SocialApp</Link>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link to='/conversation' className="p-2 rounded-full hover:bg-bg">
          <MessageCircle size={20} />
        </Link>

        <NotificationBell/>

        <SignedIn>
          <UserButton />
        </SignedIn>

        <ThemeSelector/>
      </div>
    </div>
  )
}


export default DashboardNavbar
