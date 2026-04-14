import { User, Gauge, Book, Users, MessageSquareText, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { useUserStore } from '~/zustand/userStore'

const sidebarItems = [
  {
    to: '/dashboard',
    icon: Gauge,
    label: 'Dashboard'
  },
  {
    to: '/dashboard/list-users',
    icon: Users,
    label: 'Users'
  },
  {
    to: '/dashboard/list-posts',
    icon: Book,
    label: 'Posts'
  },
  {
    to: '/dashboard/list-comments',
    icon: MessageSquareText,
    label: 'Comments'
  },
  {
    to: '/dashboard/setting',
    icon: Settings,
    label: 'Settings'
  }
]

const DashboardSidebar = ({ collapsed }) => {
  const currentUser = useUserStore(s => s.user)

  return (
    <>
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
        </div>

      </div>
    </>
  )
}

export default DashboardSidebar