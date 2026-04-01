import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import ThemeApplier from '~/components/theme/themeApplier'
import { useAuth, useUser } from '@clerk/clerk-react'
import { lazy, Suspense, useEffect, useMemo } from 'react'
import { Toaster } from 'react-hot-toast'
import { useResolvedTheme } from './hooks/useResolvedTheme'
import { injectStore } from './utils/authorizedAxios'
import { useUserStore } from './zustand/userStore'
import { useSocketStore } from './zustand/useSocketStore'
import { useGetMe } from './hooks/TanstackQuery'
import ScrollToTop from '~/components/helper/ScrollToTop'
import { Loader2 } from 'lucide-react'

const MainLayout = lazy(() => import('~/pages/MainLayout/MainLayout'))
const Feed = lazy(() => import('~/pages/MainLayout/Feed'))
const Conversation = lazy(() => import('~/pages/MainLayout/Conversation'))
const Reels = lazy(() => import('~/pages/MainLayout/Reels'))
const PostDetail = lazy(() => import('~/pages/MainLayout/PostDetail'))
const Explore = lazy(() => import('~/pages/MainLayout/Explore'))
const Login = lazy(() => import('./pages/Auth/Login'))
const NotFoundPage = lazy(() => import('~/pages/404/NotFoundPage'))
const Profile = lazy(() => import('~/pages/MainLayout/Profile'))

const ProtectedRoute = ({ isLoaded, isSignedIn }) => {
  if (!isLoaded) return null
  if (!isSignedIn) return <Navigate to='/login' replace={true} />
  return <Outlet />
}

function App() {

  const { isLoaded, isSignedIn } = useUser()
  const { getToken } = useAuth()
  const resolvedTheme = useResolvedTheme()
  const { setUser, clearUser, user: currentUser } = useUserStore()
  const { manageSocket } = useSocketStore()

  const { data } = useGetMe(isLoaded, isSignedIn)

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
        await manageSocket(currentUser?._id, getToken)
      } catch (err) {
        // eslint-disable-next-line no-console
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

  // Tối ưu UI cho Toaster để tránh re-render logic phức tạp trong return
  const toastStyle = useMemo(() => ({
    style: {
      backgroundColor: (resolvedTheme === 'dark' || resolvedTheme?.name === 'dark') ? 'white' : 'black',
      color: (resolvedTheme === 'dark' || resolvedTheme?.name === 'dark') ? 'black' : 'white'
    }
  }), [resolvedTheme])

  return (
    <>
      <Suspense fallback={
        <div className="flex items-center h-screen w-full justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }>
        <ScrollToTop/>
        <ThemeApplier/>
        <Toaster toastOptions={toastStyle}
        />
        <Routes>
          <Route path="/login" element={!isSignedIn ? <Login /> : <Navigate to="/" />} />

          <Route element={<ProtectedRoute isLoaded={isLoaded} isSignedIn={isSignedIn} />}>

            <Route path='/' element={<MainLayout/>}>
              <Route index element={<Feed />} />
              <Route path='profile/:userId' element={<Profile/>}/>
              <Route path='detail/:postId' element={<PostDetail/>}/>
              <Route path='reels' element={<Reels/>}/>
              <Route path='conversation' element={<Conversation />}>
                <Route index element= {<Conversation/>} />
                <Route path=':conversationId' element={<Conversation/>} />
                <Route path='new/:receiverId' element={<Conversation/>} />
              </Route>
              <Route path='explore' element={<Explore/>}/>
            </Route>

          </Route>


          <Route element={<ProtectedRoute isLoaded={isLoaded} isSignedIn={isSignedIn} />}>
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
      </Suspense>


    </>
  )
}

export default App
