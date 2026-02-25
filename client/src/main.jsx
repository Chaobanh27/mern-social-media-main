import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import 'swiper/css'
import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { scan } from 'react-scan'

scan({
  enabled: true,
  log: true
})
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

const queryClient = new QueryClient()
window.__TANSTACK_QUERY_CLIENT__ = queryClient

createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename='/'>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </ClerkProvider>

)
