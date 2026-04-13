/* eslint-disable no-console */
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { checkConversationAPI,
  createNewCommentAPI,
  createGroupConversation,
  createMessageAPI,
  createNewPostAPI,
  createNewReplyAPI,
  createNewStoryAPI,
  fetchUsersAPI,
  getCommentsByPostAPI,
  getConversationsAPI,
  getFeedAPI,
  getMessagesByConversationIdAPI,
  getPostAPI,
  getStoriesAPI,
  getUserByIdAPI,
  handleToggleReactionAPI,
  toggleActiveByIdAPI,
  updateCommentAPI,
  markAsReadAPI,
  getTwilioTokenAPI,
  fetchMeAPI,
  getNotificationsAPI,
  markAllReadAPI,
  toggleBookmarkAPI,
  getPostsByUserAPI,
  pinPostAPI
} from '~/apis'
import { useUserStore } from '~/zustand/userStore'

//USER
export const useGetMe = (isLoaded, isSignedIn) => {
  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMeAPI,
    enabled: isLoaded && isSignedIn,
    staleTime: 5 * 60 * 1000
  })
}

//NOTIFICATION
export const useGetNotifications = (userId) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: getNotificationsAPI,
    staleTime: 5 * 60 * 1000,
    enabled: !!userId
  })
}

export const useMarkAllRead = (userId) => {
  const queryClient = useQueryClient()
  const queryKey = ['notifications', userId]

  return useMutation({
    mutationFn: markAllReadAPI,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })

      const previousNotifications = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, oldData => {
        if (!oldData) return oldData
        return oldData.map(n => ({
          ...n,
          isRead: true
        }))
      })

      return { previousNotifications }
    },
    onSuccess: () => {
      toast.success('All is Read')
    },
    onError: (err, newItem, context) => {
      queryClient.setQueryData(queryKey, context.previousNotifications)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  })
}

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

export const useGetFeed = (userId, limit) => {
  return useInfiniteQuery({
    queryKey: ['posts', 'feed', userId],
    queryFn: ({ pageParam }) => getFeedAPI(limit, pageParam),
    getNextPageParam: lastPage => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined
    },
    initialPageParam: null,
    staleTime: 1000 * 60 * 5
  })
}

export const useGetPost = (postId) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostAPI(postId)
  })
}

export const useGetPostsByUser = (userId, limit) => {
  return useInfiniteQuery({
    queryKey: ['posts', userId],
    queryFn: ({ pageParam }) => getPostsByUserAPI(limit, pageParam),
    getNextPageParam: lastPage => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined
    },
    initialPageParam: null,
    staleTime: 1000 * 60 * 5
  })
}

export const useToggleBookmark = () => {
  return useMutation({
    mutationFn: toggleBookmarkAPI,
    onSuccess: () => {
      toast.success('bookmark successfully !')
    }
  })
}

export const useGetBookmarks = (userId, limit) => {
  return useInfiniteQuery({
    queryKey: ['bookmarks', userId],
    queryFn: ({ pageParam }) => getFeedAPI(limit, pageParam),
    getNextPageParam: lastPage => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined
    },
    initialPageParam: null,
    staleTime: 1000 * 60 * 5
  })
}

export const usePinPost = () => {
  return useMutation({
    mutationFn: pinPostAPI,
    onSuccess: () => {
      toast.success('pinned post !')
    }
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

export const useUpdateComment = (postId) => {
  const queryClient = useQueryClient()
  const queryKey = ['comments', postId]

  return useMutation({
    mutationFn: updateCommentAPI,

    onMutate: async (updatedComment) => {
      await queryClient.cancelQueries({ queryKey })

      const previousComments = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (oldData) => {
        console.log(oldData)
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData?.pages?.map(page => ({
            ...page,
            data: page?.data?.map(c => {
              console.log(c)
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
export const useToggleReaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ targetId, reactionType, targetType, conversationId, socketId }) => handleToggleReactionAPI(targetId, { reactionType, targetType, conversationId, socketId }),
    onMutate: async ({ targetId, reactionType, targetType, postId, conversationId }) => {
      console.log('conversationId: ', conversationId)
      let queryKey
      switch (targetType) {
      case 'post' :
        queryKey = ['post', postId]
        break
      case 'comment' :
        queryKey = ['comments', postId]
        break
      case 'message':
        queryKey = ['messages', conversationId]
        break
      default:
        break
      }

      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, oldData => {
        if (!oldData) return oldData
        switch (targetType) {
        case 'post' :
          console.log('old post data: ', oldData)
          console.log(targetId)
          console.log(reactionType)
          console.log('post')
          break
        case 'comment':
          console.log('old comment data: ', oldData)
          console.log(targetId)
          console.log(reactionType)
          console.log('comment')
          break
        case 'message' :
          return {
            ...oldData,
            pages: oldData.pages.map(p => ({
              ...p,
              data: p.data.map(m => {
                if (m._id !== targetId) return m
                console.log('m', m._id)

                const oldReaction = m.myReaction
                const newSummary = { ...m.reactionSummary }

                //Nếu click cùng 1 reaction
                if (oldReaction === reactionType) {
                  newSummary[oldReaction] -= 1
                  if (newSummary[oldReaction] <= 0 ) delete newSummary[oldReaction]
                }
                //Nếu click không cùng 1 reaction
                else {
                  //Nếu có tồn tại oldReaction và summary cũng có oldReaction
                  if (oldReaction && newSummary[oldReaction]) {
                    // Giảm đi 1 hoặc xóa nếu nhỏ hơn 0
                    newSummary[oldReaction]-= 1
                    if (newSummary[oldReaction] <= 0) delete newSummary[oldReaction]
                  }
                  //nếu chưa tồn tại oldReaction và summary cũng không có oldReaction thì tạo mới
                  newSummary[reactionType] = (newSummary[reactionType] || 0) + 1
                }

                return {
                  ...m,
                  myReaction: oldReaction === reactionType ? null : reactionType,
                  reactionSummary: newSummary
                }
              })
            }))
          }
        default:
          break
        }
      })

      return { previousData, queryKey }
    },
    onSuccess: (updatedData) => {
      toast.success('reaction thành công')
    },
    onError: (error, variables, context) => {
      toast.error(error.message || 'Something wrong !')
      console.error('Mutation Error:', error)
    },

    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: context })
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

export const useGetUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsersAPI,
    staleTime: 1000 * 60 * 5
  })
}


//CONVERSATION
export const useGetConversations = (limit) => {
  return useInfiniteQuery({
    queryKey: ['conversations'],
    queryFn: ({ pageParam }) => getConversationsAPI(limit, pageParam),
    staleTime: 1000 * 60 * 5,
    getNextPageParam: lastPage => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined
    },
    initialPageParam: null
  })
}

export const useGetUserById = (userId) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserByIdAPI(userId),
    staleTime: 1000 * 60 * 5
  })
}

export const useCheckConversation = () => {
  return useMutation({
    mutationFn: checkConversationAPI
  })
}

export const useGetMessagesByConversationId = (conversationId, limit, isTemp = false) => {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: ({ pageParam }) => getMessagesByConversationIdAPI(conversationId, limit, pageParam),
    enabled: !!conversationId && !isTemp && !conversationId.toString().startsWith('temp_'),
    // Hàm này quyết định trang tiếp theo dùng cursor nào
    getNextPageParam: lastPage => {
      // Nếu lastPage.hasMore là true, trả về nextCursor để làm pageParam cho lần sau
      return lastPage.hasMore ? lastPage.nextCursor : undefined
    },
    // Mặc định pageParam đầu tiên là undefined (hoặc null)
    initialPageParam: null
  })
}

export const useSendMessage = (conversationId) => {
  const queryClient = useQueryClient()
  const queryKey = ['messages', conversationId]
  const conversationQueryKey = ['conversations']
  const currentUser = useUserStore(s => s.user)

  return useMutation({
    mutationFn: createMessageAPI,
    onMutate: async (newMessage) => {

      await queryClient.cancelQueries({ queryKey: queryKey })
      await queryClient.cancelQueries({ queryKey: conversationQueryKey })

      const previousMessages = queryClient.getQueryData(queryKey)
      const previousConversations = queryClient.getQueryData(conversationQueryKey)
      const now = new Date().toISOString()

      const optimisticMessage = {
        _id: Date.now().toString(),
        sender: { ...currentUser },
        content: newMessage.message || '',
        media: newMessage.media || [],
        messageType: newMessage.messageType,
        conversationId: conversationId,
        createdAt: now,
        updatedAt: now,
        status: 'sending'
      }

      const giphy = {
        still: newMessage.gif?.still,
        title: newMessage.gif?.title
      }

      if (newMessage.gif) {
        optimisticMessage.giphy = giphy
      }

      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData


        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            if (index === 0) {
              return { ...page, data: [optimisticMessage, ...page.data] }
            }
            return page
          })
        }
      })

      queryClient.setQueryData(conversationQueryKey, oldData => {
        if (!oldData) return oldData

        let targetConversation = null

        const cleanPages = oldData.pages.map(p => {
          const filteredData = p.data.filter( c => {
            if (c._id === conversationId) {
              let lastMsgText = optimisticMessage.content
              if (!lastMsgText) {
                lastMsgText = optimisticMessage.giphy ? 'Sent a GIF' : 'Sent media'
              }
              targetConversation = {
                ...c,
                lastMessage: {
                  ...optimisticMessage,
                  content: lastMsgText
                },
                updatedAt: now,
                unreadCount: 0
              }
              return false
            }
            return true
          })
          return { ...p, data: filteredData }
        })

        if (!targetConversation) return oldData

        const newPages = [...cleanPages]

        newPages[0] = {
          ...newPages[0],
          data: [targetConversation, ...newPages[0].data]
        }

        return { ...oldData, pages: newPages }
      })
      return { previousMessages, previousConversations }
    },
    onError: (err, newMessage, context) => {
      console.log(err)
      queryClient.setQueryData(queryKey, context?.previousMessages)
      queryClient.setQueryData(conversationQueryKey, context.previousConversations)
      toast.error('Thêm tin nhắn thất bại!')
    },
    onSettled: () => {
      // Làm mới chính xác query tin nhắn của hội thoại này
      queryClient.invalidateQueries({
        queryKey: queryKey,
        exact: true
      })

      // Làm mới chính xác danh sách hội thoại
      queryClient.invalidateQueries({
        queryKey: conversationQueryKey,
        exact: true
      })
    }
  })
}

export const useCreateGroupConversation = () => {
  const queryClient = useQueryClient()
  const queryKey = ['conversations']

  return useMutation({
    mutationFn: createGroupConversation,
    onSuccess: (newGroupConversation) => {
      toast.success('Tạo nhóm thành công')
      console.log(newGroupConversation)
    },
    onError: (err) => {
      console.log(err)
      toast.error('Thêm bình luận thất bại!')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  })
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()
  const queryKey = ['conversations']
  return useMutation({
    mutationFn: (conversationId) => markAsReadAPI(conversationId),

    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey })

      const previousConversations = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            data: page.data.map(conv =>
              conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
            )
          }))
        }
      })

      return { previousConversations }
    },

    onError: (err, conversationId, context) => {
      queryClient.setQueryData(queryKey, context.previousConversations)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  })
}

export const useGetTwilioToken = () => {
  return useMutation({
    mutationFn: ({ roomName }) => getTwilioTokenAPI(roomName)
  })
}
