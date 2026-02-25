import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createNewPostAPI, getFeedAPI } from '~/apis'


export const useGetPosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: getFeedAPI,
    staleTime: 1000 * 60 * 5
  })
}

export const useCreatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createNewPostAPI,
    onSuccess: (newPost) => {
      queryClient.setQueryData(['posts'], (oldData) => {
        return oldData ? [newPost, ...oldData] : [newPost]
      })
    },
    onError: error => {
      console.log(error)
    }
  })
}