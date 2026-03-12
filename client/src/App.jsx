import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import MainLayout from '~/pages/MainLayout/MainLayout'
import Feed from '~/pages/MainLayout/Feed'
import ThemeApplier from '~/components/theme/themeApplier'
import NotFoundPage from '~/pages/404/NotFoundPage'
import Profile from '~/pages/MainLayout/Profile'
import Reels from '~/pages/MainLayout/Reels'
import Messages from '~/pages/MainLayout/Messages'
import PostDetail from '~/pages/MainLayout/PostDetail'
import ScrollToTop from '~/components/helper/ScrollToTop'
import Explore from '~/pages/MainLayout/Explore'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { fetchMeAPI } from './apis'
import Login from './pages/Auth/Login'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useResolvedTheme } from './hooks/useResolvedTheme'
import { injectStore } from './utils/authorizedAxios'
import { useUserStore } from './zustand/userStore'

const ProtectedRoute = ({ user }) => {
  if (!user) return <Navigate to='/login' replace={true} />
  return <Outlet />
}

function App() {

  const { isLoaded, isSignedIn } = useUser()
  const { getToken } = useAuth()
  const resolvedTheme = useResolvedTheme()

  useEffect(() => {
    // Truyền hàm lấy token vào Axios
    injectStore(getToken)
  }, [getToken])

  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMeAPI,
    enabled: isLoaded && isSignedIn,
    staleTime: 5 * 60 * 1000
  })

  const { setUser, clearUser } = useUserStore()

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      clearUser()
      return
    }

    if (data) {
      setUser(data)
    }
  }, [isLoaded, isSignedIn, data, setUser, clearUser])

  return (
    <>
      <ScrollToTop/>
      <ThemeApplier/>
      <Toaster toastOptions={{
        style:{
          backgroundColor: resolvedTheme === 'dark' || resolvedTheme.name === 'dark' ? 'white' : 'black',
          color: resolvedTheme === 'dark' || resolvedTheme.name === 'dark' ? 'black' : 'white'
        }
      }}
      />
      <Routes>

        <Route path='/' element={!isSignedIn ? <Login/> : <MainLayout/>}>
          <Route index element={<Feed />} />
          <Route path='profile' element={<Profile/>}/>
          <Route path='detail/:postId' element={<PostDetail/>}/>
          <Route path='reels' element={<Reels/>}/>
          <Route path='messages' element={<Messages/>}/>
          <Route path='explore' element={<Explore/>}/>
        </Route>


        <Route element={<ProtectedRoute user={data} />}>
          {/* <Route path='/dashboard' element={<DashboardLayout />}>
            <Route index element={<Dashboard/>} />
            <Route path='setting' element={<Settings/>}>
              <Route index element={<AccountTab/>}/>
              <Route path='security-tab' element={<SecurityTab/>}/>
            </Route>
          </Route> */}
        </Route>

        <Route path='*' element={<NotFoundPage/>} />

      </Routes>

    </>
  )
}

export default App
