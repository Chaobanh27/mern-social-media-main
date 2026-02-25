import { Home, PlusSquare, Video, User, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

const BottomNavbar = () => {
  return (
    <nav className="h-14 bg-bg-alt border-t border-border flex justify-around items-center">
      <Link to='/'>
        <Home size={22}/>
      </Link>
      <Link to='/explore' >
        <Compass size={22}/>
      </Link>
      <Link>
        <PlusSquare size={22}/>
      </Link>
      <Link to='/reels'>
        <Video size={22}/>
      </Link>
      <Link to='/profile'>
        <User size={22}/>
      </Link>
    </nav>
  )
}

export default BottomNavbar
