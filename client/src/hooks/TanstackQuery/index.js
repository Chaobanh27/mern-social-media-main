/* eslint-disable no-console */
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createNewCommentAPI, createNewPostAPI, createNewReplyAPI, createNewStoryAPI, getCommentsByPostAPI, getFeedAPI, getPostAPI, getStoriesAPI, handleToggleReactionAPI, toggleActiveByIdAPI, updateCommentAPI } from '~/apis'
import { useUserStore } from '~/zustand/userStore'

// POST
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

export const useGetPosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: getFeedAPI,
    staleTime: 1000 * 60 * 5
  })
}

export const useGetPost = (postId) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostAPI(postId)
  })
}

//COMMENT & REPLY
export const useGetCommentsByPost = (postId, limit ) => {
  return useInfiniteQuery({
    // queryKey bao gồm postId để khi đổi post, dữ liệu tự refresh
    queryKey: ['comments', postId],

    // queryFn nhận vào { pageParam } (đây chính là cursor)
    queryFn: ({ pageParam }) => getCommentsByPostAPI(postId, limit, pageParam),

    // Hàm này quyết định trang tiếp theo dùng cursor nào
    getNextPageParam: lastPage => {
      // Nếu lastPage.hasMore là true, trả về nextCursor để làm pageParam cho lần sau
      return lastPage.hasMore ? lastPage.nextCursor : undefined
    },
    // Mặc định pageParam đầu tiên là undefined (hoặc null)
    initialPageParam: null
  })
}

export const useCreateComment = (postId) => {
  const queryClient = useQueryClient()
  const queryKey = ['comments', postId]

  const currentUser = useUserStore(s => s.user)
  return useMutation({
    mutationFn: createNewCommentAPI,
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({ queryKey })
      const previousComments = queryClient.getQueryData(queryKey)
      const now = new Date()
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData
        const optimisticComment = {
          _id: Date.now().toString(),
          user: { ...currentUser },
          content: newComment.content,
          myReaction: null,
          createdAt: now.toISOString(),
          replies: [],
          postId: postId
        }

        const giphy = {
          still: newComment.gif?.still,
          title: newComment.gif?.title
        }

        if (newComment.gif) {
          optimisticComment.giphy = giphy
        }


        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            if (index === 0) {
              return { ...page, data: [optimisticComment, ...page.data] }
            }
            return page
          })
        }
      })
      return { previousComments }
    },
    onSuccess: () => {
      toast.success('Thêm bình luận thành công!')
    },
    onError: (err, newComment, context) => {
      queryClient.setQueryData(queryKey, context?.previousComments)
      toast.error('Thêm bình luận thất bại!')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  })
}

export const useCreateReply = (postId) => {
  const queryClient = useQueryClient()
  const queryKey = ['comments', postId]
  const currentUser = useUserStore(s => s.user)

  return useMutation({
    mutationFn: createNewReplyAPI,
    onMutate: async (newReply) => {
      await queryClient.cancelQueries({ queryKey })
      const previousComments = queryClient.getQueryData(queryKey)
      const now = new Date()

      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData
        const optimisticComment = {
          _id: Date.now().toString(),
          user: { ...currentUser },
          content: newReply.replyContent,
          myReaction: null,
          createdAt: now.toISOString(),
          parentComment: newReply.parentCommentId
        }
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            data: page.data.map(comment => {
              if (comment._id === newReply.parentCommentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), optimisticComment]
                }
              }
              return comment
            })
          }))
        }
      })
      return { previousComments }
    },
    onSuccess: () => {
      toast.success('Thêm bình luận thành công!')
    },
    onError: (err, newReply, context) => {
      queryClient.setQueryData(queryKey, context.previousComments)
      toast.error('Thêm phản hồi thất bại!')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  })
}

// export const useCreateComment = (postId) => {
//   const queryClient = useQueryClient()
//   const queryKey = ['comments', postId]

//   return useMutation({
//     mutationFn: createNewCommentAPI,

//     onSuccess: (newComment) => {
//       queryClient.setQueryData(queryKey, (oldData) => {
//         if (!oldData) return { data: [newComment], totalCommentsByPost: 1 }

//         return {
//           ...oldData,
//           data: [newComment, ...oldData.data],
//           totalCommentsByPost: oldData.totalCommentsByPost + 1
//         }
//       })

//       toast.success('Đã thêm bình luận!')
//     },

//     onError: (error) => {
//       toast.error(error.message || 'Something wrong !')
//       console.error('Mutation Error:', error)
//     },

//     onSettled: () => {
//       // Vẫn nên gọi cái này để đảm bảo mọi thứ (như phân trang, timestamp) chuẩn đét
//       queryClient.invalidateQueries({ queryKey })
//     }
//   })
// }

// export const useCreateReply = (postId) => {
//   const queryClient = useQueryClient()
//   const queryKey = ['comments', postId]

//   return useMutation({
//     mutationFn: createNewReplyAPI,
//     onSuccess: (newReply) => {
//       queryClient.setQueryData(queryKey, (oldData) => {
//         if (!oldData) return oldData

//         const newData = { ...oldData }

//         newData.data = newData?.data.map((comment) => {
//           if (comment._id === newReply.parentComment) {
//             return {
//               ...comment,
//               replies: [...comment.replies, newReply]
//             }
//           }
//           return comment
//         })

//         return newData
//       })
//       toast.success('Đã thêm phản hồi!')
//     },
//     onError: (error) => {
//       toast.error(error.message || 'Something wrong !')
//       console.error('Mutation Error:', error)
//     },

//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey })
//     }
//   })
// }

export const useUpdateComment = (postId) => {
  const queryClient = useQueryClient()
  const queryKey = ['comments', postId]

  return useMutation({
    mutationFn: updateCommentAPI,

    onMutate: async (updatedComment) => {
      await queryClient.cancelQueries({ queryKey })

      const previousComments = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (oldData) => {
        console.log(oldData);
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData?.pages?.map(page => ({
            ...page,
            data: page?.data?.map(c => {
              console.log(c);
              if (c._id === updatedComment.commentId) {
                const comment = { ...c, content: updatedComment?.data?.content }
                return comment
              }

              if (c.replies) {
                return {
                  ...c,
                  replies: c.replies.map(r => {
                    if (r.id === updatedComment.commentId) {
                      const reply = { ...r, content: updatedComment?.data?.content }
                      return reply
                    }
                    return r
                  }
                  )
                }
              }
              return c
            })
          }))
        }
      })

      return { previousComments }
    },


    onSuccess: () => {
      toast.success('update comment thành công')
    },

    onError: (err, updatedComment, context) => {
      queryClient.setQueryData(queryKey, context.previousComments)
      toast.error('Cập nhật thất bại, đã khôi phục dữ liệu!')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  })
}


//STORY
export const useCreateStory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createNewStoryAPI,
    onSuccess: (newStory) => {
      queryClient.setQueryData(['stories'], (oldData) => {
        return oldData ? [newStory, ...oldData] : [newStory]
      })
    },
    onError: error => {
      console.log(error)
    }
  })
}

export const useGetStories = () => {
  return useQuery({
    queryKey: ['stories'],
    queryFn: getStoriesAPI,
    staleTime: 1000 * 60 * 5
  })
}

//REACTION
export const useToggleReaction = (targetId, targetType) => {
  const queryClient = useQueryClient()
  const queryKey = ['reactions', targetType, targetId]

  return useMutation({
    mutationFn: (data) => handleToggleReactionAPI(targetId, { ...data, targetType }),

    onSuccess: (updatedData) => {
      console.log(updatedData)
      toast.success('reaction thành công')
    },
    onError: (error) => {
      toast.error(error.message || 'Something wrong !')
      console.error('Mutation Error:', error)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  })
}

//ACTIVE
export const useToggleActive = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, id }) => toggleActiveByIdAPI({ name, id }),
    onMutate: async ({ name, id, postId }) => {
      const queryKey = name === 'comments' ? ['comments', postId] : [name]
      //Hủy tất cả query đang chạy để tránh xung đột dữ liệu
      await queryClient.cancelQueries({ queryKey })

      //Lấy dữu liệu trước khi update để có gì rollback nếu
      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, oldData => {
        if (!oldData) return oldData

        if (name === 'comments') {
          return {
            ...oldData,
            pages: oldData.pages.map(page => {
              const commentToDelete = page.data.find(c => c._id === id)
              const isParentComment = !!commentToDelete
              let totalCommentsByPostToDelete
              if (isParentComment) {
                const repliesLength = commentToDelete.replies?.length || 0
                totalCommentsByPostToDelete = repliesLength + 1
              } else {
                const replyToDelete = page.data.find(c => c.replies?.some(r => r._id === id))
                if (replyToDelete) totalCommentsByPostToDelete = 1
              }
              return {
                ...page,
                data : page.data.filter(c => c._id !== id)
                  .map(c => ({
                    ...c,
                    replies: c.replies?.filter(r => r._id !== id)
                  })),
                totalCommentsByPost : page.totalCommentsByPost - totalCommentsByPostToDelete
              }

            })
          }
        }
      })

      return { previousData, queryKey }
    },

    onSuccess: () => {
      toast.success('xóa comment thành công')
    },

    onError: (error, variables, context) => {
      console.log(error)
      queryClient.setQueryData(context.queryKey, context.previousData)
    },

    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: context.queryKey })
    }
  })

}