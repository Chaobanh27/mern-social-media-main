import toast from 'react-hot-toast'
import authorizedAxiosInstance from '~/utils/authorizedAxios'

/*
Cơ chế ép kiểu của Template String: Trong JavaScript, khi đặt một biến vào trong dấu backticks (`), JS sẽ tự động gọi phương thức .toString() của biến đó để nối chuỗi.
String(null) sẽ trở thành "null".
String(undefined) sẽ trở thành "undefined"
vì thế nên sử dụng obj params của axios :
Axios có cơ chế tự động xử lý các giá trị null hoặc undefined. Nếu truyền một object vào field params, Axios sẽ bỏ qua các field có giá trị null/undefined thay vì biến chúng thành string
 */
export const fetchStatusAPI = async () => {
  const response = await authorizedAxiosInstance.get('/v1/status')
  toast.success('fetch status successfully', { theme: 'colored' })
  return response.data
}

export const deleteAllAPI = async () => {
  const response = await authorizedAxiosInstance.delete('/v1/tests/delete-all')
  toast.success('Deleted All', { theme: 'colored' })
  return response.data
}

export const fetchMeAPI = async () => {
  const response = await authorizedAxiosInstance.get('/v1/users/me')
  toast.success('fetch user data successfully', { theme: 'colored' })
  return response.data
}

export const fetchUsersAPI = async () => {
  const response = await authorizedAxiosInstance.get('/v1/users/')
  return response.data
}

export const testAllUsersAPI = async () => {
  const response = await authorizedAxiosInstance.get('/v1/tests/fetchAllUsers')
  return response.data
}

export const signUploadAPI = async (data) => {
  const response = await authorizedAxiosInstance.post('/v1/upload/sign', data)
  return response.data
}

export const createNewPostAPI = async (data) => {
  const response = await authorizedAxiosInstance.post('/v1/posts', data)
  return response.data
}

export const createNewStoryAPI = async (data) => {
  const response = await authorizedAxiosInstance.post('/v1/stories', data)
  return response.data
}

export const getPostAPI = async (postId) => {
  const response = await authorizedAxiosInstance.get(`/v1/posts/${postId}`)
  return response.data
}

export const getPostsByUserAPI = async (userId, limit, cursor) => {
  const response = await authorizedAxiosInstance.get(`/v1/posts/${userId}`, {
    params: {
      limit: limit,
      cursor: cursor
    }
  })
  return response.data
}

export const getFeedAPI = async (limit, cursor) => {
  const response = await authorizedAxiosInstance.get(`/v1/posts?limit=${limit}&cursor=${cursor}`)
  return response.data
}

export const pinPostAPI = async (postId) => {
  const res = await authorizedAxiosInstance.patch(`/v1/posts/${postId}`)
  return res.data
}

export const toggleBookmarkAPI = async (postId) => {
  const res = await authorizedAxiosInstance.post(`/v1/posts/bookmark/${postId}`)
  return res.data
}

export const getBookmarksAPI = async (limit, cursor) => {
  const res = await authorizedAxiosInstance.get(`/v1/posts/bookmark?limit=${limit}&cursor=${cursor}`)
  return res.data
}

export const getStoriesAPI = async () => {
  const response = await authorizedAxiosInstance.get('/v1/stories')
  return response.data
}


export const createNewCommentAPI = async (data) => {
  const res = await authorizedAxiosInstance.post('/v1/comments/', data)
  return res.data
}

export const updateCommentAPI = async ({ commentId, data }) => {
  const res = await authorizedAxiosInstance.put(`/v1/comments/${commentId}`, data)
  return res.data
}

export const getCommentsByPostAPI = async (postId, limit, cursor) => {
  const res = await authorizedAxiosInstance.get(`/v1/comments/by-post/${postId}?limit=${limit}&cursor=${cursor}`)
  return res.data
}

export const createNewReplyAPI = async (data) => {
  const res = await authorizedAxiosInstance.post('/v1/comments/reply', data)
  return res.data
}

export const toggleActiveByIdAPI = async ({ name, id }) => {
  const commentId = id
  const res = await authorizedAxiosInstance.patch(`/v1/${name}/${name === 'comments' && commentId }`)
  return res.data
}

export const handleToggleReactionAPI = async (id, data) => {
  const res = await authorizedAxiosInstance.post(`/v1/reactions/${id}`, data)
  return res.data
}

export const getConversationsAPI = async (limit, cursor) => {
  const res = await authorizedAxiosInstance.get(`/v1/conversations?limit=${limit}&cursor=${cursor}`)
  return res.data
}

export const getUserByIdAPI = async (userId) => {
  const res = await authorizedAxiosInstance.get(`/v1/users/${userId}`)
  return res.data
}

export const createMessageAPI = async (data) => {
  const res = await authorizedAxiosInstance.post('/v1/messages/', data)
  return res.data
}

export const getMessagesByConversationIdAPI = async (conversationId, limit, cursor) => {
  const res = await authorizedAxiosInstance.get(`/v1/conversations/${conversationId}/messages?limit=${limit}&cursor=${cursor}`)
  return res.data
}

export const checkConversationAPI = async (data) => {
  const res = await authorizedAxiosInstance.post('/v1/conversations/check', data)
  return res.data
}

export const createGroupConversation = async (data) => {
  const res = await authorizedAxiosInstance.post('/v1/conversations/group', data)
  return res.data
}

export const markAsReadAPI = async (conversationsId) => {
  const res = await authorizedAxiosInstance.put(`/v1/conversations/${conversationsId}`)
  return res.data
}

export const getTwilioTokenAPI = async ( roomName ) => {
  const res = await authorizedAxiosInstance.get(`/v1/calls/token?roomName=${roomName}`)
  return res.data
}

export const getNotificationsAPI = async () => {
  const res = await authorizedAxiosInstance.get('/v1/notifications')
  return res.data
}

export const markAllReadAPI = async () => {
  const res = await authorizedAxiosInstance.put('/v1/notifications/mark-all-read')
  return res.data
}
