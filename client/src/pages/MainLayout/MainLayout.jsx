
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
  const checkPath = location.pathname.includes('messages') || location.pathname.includes('reels')

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
    <div className="min-h-screen bg-bg transition-slow ">

      {/* Top Navigation */}
      <header className="fixed top-0 inset-x-0 h-14 bg-bg-alt transition-slow border-b border-border z-50">
        <Navbar/>
      </header>

      {/* Content */}
      <div className="pt-14 pb-14 md:pb-0 mx-auto flex max-w-full 2xl:max-w-450 3xl:max-w-[2200px]">
        {/* Left Sidebar */}
        {
          checkPath ? null :
            <aside className="hidden md:block w-16 lg:w-65 shrink-0 bg-bg-alt transition-slow ">
              <LeftSidebar collapsed = {collapsed}/>
            </aside>
        }


        {/* Main Feed */}
        <main className={clsx('flex-1 min-w-0', { 'px-0 sm:px-0': checkPath, 'px-3 sm:px-6': !checkPath })}>
          <Outlet/>
          {!checkPath && (
            <div className="hidden md:block">
              <FloatingChatContainer/>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        {
          checkPath ? null :
            <aside className="hidden lg:block w-[320px] shrink-0 bg-bg-alt transition-slow ">
              <RightSidebar/>
            </aside>
        }

      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50">
        <BottomNavbar/>
      </div>

    </div>
  )
}

export default MainLayout
