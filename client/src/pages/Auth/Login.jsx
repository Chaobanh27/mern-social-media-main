import { SignIn } from '@clerk/clerk-react'
import { useResolvedTheme } from '~/hooks/useResolvedTheme'

const Login = () => {
  const resolvedTheme = useResolvedTheme()

  return (
    <div className='min-h-screen bg-bg flex justify-center items-center'>
      <SignIn appearance={{
        theme: resolvedTheme
      }}/>
    </div>
  )
}

export default Login
