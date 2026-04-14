import { useEffect, useState } from 'react'
import DashboardBottomNavbar from '~/components/dashboard/DashboardBottomNavbar'
import DashboardNavbar from '~/components/dashboard/DashboardNavbar'
import DashboardSidebar from '~/components/dashboard/DashboardSidebar'

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false)

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
    <div className="main-layout-root">

      <header className="main-layout-header">
        <DashboardNavbar/>
      </header>

      <div className="main-layout-container">
        <aside className="main-layout-sidebar main-layout-sidebar-left">
          <DashboardSidebar collapsed={collapsed}/>
        </aside>
        <main className="flex-1 min-w-0 p-4">
          <div className="
                grid grid-cols-2 sm:grid-cols-3
                gap-2 sm:gap-4
            ">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="aspect-square bg-bg-alt rounded-lg relative group">

                {/* Hover overlay */}
                <div className="
                absolute inset-0 bg-black/40
                opacity-0 group-hover:opacity-100
                transition
                flex items-center justify-center
                 text-white text-sm
                ">
                    View
                </div>

              </div>
            ))}
          </div>
        </main>
      </div>

      <div className="main-layout-mobile-nav border">
        <DashboardBottomNavbar/>
      </div>
    </div>
  )
}

export default DashboardLayout