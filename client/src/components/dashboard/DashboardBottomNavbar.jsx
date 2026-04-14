import { Gauge, Users, Book, MessageSquareText, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'

const DashboardBottomNavbar = () => {
  return (
    <nav className="h-14 bg-bg-alt border-t border-border flex justify-around items-center">
      <Link to='/dashboard'>
        <Gauge size={22}/>
      </Link>
      <Link to='/dashboard/list-users' >
        <Users size={22}/>
      </Link>
      <Link to='/dashboard/list-posts'>
        <Book size={22}/>
      </Link>
      <Link to='/dashboard/list-comments'>
        <MessageSquareText size={22}/>
      </Link>
      <Link to='/dashboard/setting'>
        <Settings size={22}/>
      </Link>
    </nav>
  )
}

export default DashboardBottomNavbar
