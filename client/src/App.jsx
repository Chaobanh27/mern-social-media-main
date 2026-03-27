import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import MainLayout from '~/pages/MainLayout/MainLayout'
import Feed from '~/pages/MainLayout/Feed'
import ThemeApplier from '~/components/theme/themeApplier'
import NotFoundPage from '~/pages/404/NotFoundPage'
import Profile from '~/pages/MainLayout/Profile'
import Reels from '~/pages/MainLayout/Reels'
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
import { useSocketStore } from './zustand/useSocketStore'
import Conversation from '~/pages/MainLayout/Conversation'

const ProtectedRoute = ({ user }) => {
  if (!user) return <Navigate to='/login' replace={true} />
  return <Outlet />
}

function App() {

  const { isLoaded, isSignedIn } = useUser()
  const { getToken } = useAuth()
  const resolvedTheme = useResolvedTheme()
  const { setUser, clearUser, user: currentUser } = useUserStore()
  const { manageSocket } = useSocketStore()

  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMeAPI,
    enabled: isLoaded && isSignedIn,
    staleTime: 5 * 60 * 1000
  })

  useEffect(() => {
    if (data) {
      setUser(data)
    } else if (isLoaded && !isSignedIn) {
      clearUser()
    }
  }, [data, isLoaded, isSignedIn, setUser, clearUser])

  useEffect(() => { injectStore(getToken) }, [getToken])

  useEffect(() => {
    const startSocket = async () => {
      try {
        const token = await getToken()
        await manageSocket(currentUser?._id, token)
      } catch (err) {
        console.error('lỗi khởi tạo socket', err)
      }
    }
    if (currentUser?._id) {
      startSocket()
    }
    return () => {
      manageSocket(null)
    }
  }, [currentUser?._id, getToken, manageSocket])

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
          <Route path='profile/:userId' element={<Profile/>}/>
          <Route path='detail/:postId' element={<PostDetail/>}/>
          <Route path='reels' element={<Reels/>}/>
          {/* <Route path="conversation/:conversationId?" element={<Conversation />} /> */}
          <Route path='conversation'>
            <Route index element= {<Conversation/>} />
            <Route path=':conversationId' element={<Conversation/>} />
            <Route path='new/:receiverId' element={<Conversation/>} />
          </Route>
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
