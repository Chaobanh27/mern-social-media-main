import clsx from 'clsx'
import { Home, Compass, Video, MessageCircle, User, Gamepad, ChevronDown, Gamepad2, GamepadDirectionalIcon, Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, NavLink } from 'react-router-dom'
import { deleteAllAPI } from '~/apis'
import { useUserStore } from '~/zustand/userStore'

const sidebarItems = [
  {
    to: '/',
    icon: Home,
    label: 'Home'
  },
  {
    to: '/explore',
    icon: Compass,
    label: 'Explore'
  },
  {
    to: '/reels',
    icon: Video,
    label: 'Reels'
  },
  {
    to: '/conversation',
    icon: MessageCircle,
    label: 'Messages'
  }
]

const LeftSidebar = ({ collapsed }) => {

  const currentUser = useUserStore(s => s.user)
  const [open, setOpen] = useState(false)

  const handleDeleteAll = async () => {
    try {
      await deleteAllAPI()
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Lỗi hệ thống, không thể xóa!'
      toast.error(errorMsg, { theme: 'colored' })
    }
  }

  return (
    <div className=" sticky top-14 h-[calc(100vh-56px)] flex flex-col ">
      {/* TOP 60% */}
      <div className={clsx('flex-6 overflow-y-auto space-y-1 bo', { 'p-0': collapsed, 'p-4': !collapsed } )}>
        {
          sidebarItems.map(item => {
            const IconComponent = item.icon
            if (collapsed) {
              return (
                <NavLink to={item.to} key={item.label} className={ ({ isActive }) => `w-full flex justify-center items-center gap-3 p-1 py-5 hover:bg-bg  ${isActive ? 'bg-bg transition-slow' : ''}` }>
                  {item.icon && <IconComponent />}
                </NavLink>
              )
            }
            return (
              <NavLink to={item.to} key={item.label} className={ ({ isActive }) => `w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg ${isActive ? 'bg-bg transition-slow' : ''} `}>
                {item.icon && <IconComponent size={20} />}
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            )
          })
        }
        {
          collapsed ? (
            <NavLink to={`/profile/${currentUser._id}`} key='Profile' className={ ({ isActive }) => `w-full flex justify-center items-center gap-3 p-1 py-5 hover:bg-bg  ${isActive ? 'bg-bg transition-slow' : ''}` }>
              <User/>
            </NavLink>
          ) : (
            <NavLink to={`/profile/${currentUser._id}`} key='Profile' className={ ({ isActive }) => `w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg ${isActive ? 'bg-bg transition-slow' : ''} `}>
              <User size={20}/>
              <span className="text-sm font-medium">Profile</span>
            </NavLink>
          )
        }
      </div>

      {/* BOTTOM 40% */}
      <div className={clsx('flex-4 overflow-y-auto border-t border-border', { 'p-0': collapsed, 'p-4': !collapsed })}>
        {
          collapsed ? <NavLink to='/games' className={ ({ isActive }) => `w-full flex justify-center items-center gap-3 p-1 py-5 hover:bg-bg  ${isActive ? 'bg-bg' : ''}` }>
            <Gamepad/>
          </NavLink> : <>
            <button className='w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-bg' onClick={() => setOpen(!open)} >
              <div className='w-full flex items-center gap-3'>
                <span className="text-sm font-medium">Games</span>
              </div>
              <ChevronDown/>
            </button>
            <ul className={clsx('transition-all duration-300 overflow-hidden space-y-4', { 'max-h-40': open, 'max-h-0': !open } )} >
              <li className='mt-2'>
                <Link className="w-full flex items-center gap-3">
                  <Gamepad2/>
                  <span className="text-sm font-medium">Tic Toc Toe</span>
                </Link>
              </li>
              <li className=''>
                <Link className="w-full flex items-center gap-3">
                  <Gamepad/>
                  <span className="text-sm font-medium">Tic Toc Toe</span>
                </Link>
              </li>
              <li className=''>
                <Link className="w-full flex items-center gap-3">
                  <GamepadDirectionalIcon/>
                  <span className="text-sm font-medium">Tic Toc Toe</span>
                </Link>
              </li>
              <li className=''>
                <button onClick={handleDeleteAll} className="w-full flex items-center gap-3">
                  <Trash2/>
                  <span className="text-sm font-medium">Delete All</span>
                </button>
              </li>
            </ul>
          </>
        }
      </div>

    </div>
  )
}


export default LeftSidebar
