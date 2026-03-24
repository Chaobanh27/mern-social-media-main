import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import FloatingChatContainer from '~/components/floating-chat/FloatingChatContainer'
import BottomNavbar from '~/components/navigation/BottomNavbar'
import LeftSidebar from '~/components/navigation/LeftSideBar'
import Navbar from '~/components/navigation/Navbar'
import RightSidebar from '~/components/navigation/RightSideBar'

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const checkPath = location.pathname.includes('conversation') || location.pathname.includes('reels')

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true)
      } else {
        setCollapsed(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="main-layout-root transition-slow">

      <header className="main-layout-header transition-slow">
        <Navbar/>
      </header>

      <div className="main-layout-container">
        {!checkPath && (
          <aside className="main-layout-sidebar main-layout-sidebar-left transition-slow">
            <LeftSidebar collapsed={collapsed}/>
          </aside>
        )}

        <main className={clsx('flex-1 min-w-0', { 'px-0 sm:px-0': checkPath, 'px-3 sm:px-6': !checkPath })}>
          <Outlet/>
          {!checkPath && (
            <div className="hidden md:block">
              <FloatingChatContainer/>
            </div>
          )}
        </main>

        {!checkPath && (
          <aside className="main-layout-sidebar-right transition-slow">
            <RightSidebar/>
          </aside>
        )}
      </div>

      <div className="main-layout-mobile-nav">
        <BottomNavbar/>
      </div>

    </div>
  )
}

export default MainLayout
