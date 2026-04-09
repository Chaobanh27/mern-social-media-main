import { SignedIn, UserButton } from '@clerk/clerk-react'
import { Search, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import ThemeSelector from '~/components/theme/ThemeSelector'
import BaseInput from '../form/BaseInput'
import NotificationBell from '../notification/NotificationBell'

const Navbar = () => {

  return (
    <div className="h-full px-4 flex items-center justify-between">
      {/* Logo */}
      <Link to='/' className="font-bold text-xl">SocialApp</Link>

      {/* Search */}
      <div className="hidden sm:flex items-center bg-bg-alt transition-slow rounded-full px-3 py-1 w-72">
        <Search size={18} className="text-primary" />
        <BaseInput placeholder="Search..." className='outline-none px-2 text-sm w-full'/>
      </div>

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


export default Navbar
