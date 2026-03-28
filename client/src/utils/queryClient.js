import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    //staleTime: 5 * 60 * 1000
    }
  }
})

//Dùng để enable TanStack Query DevTools browser extension
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  window.__TANSTACK_QUERY_CLIENT__ = queryClient
}