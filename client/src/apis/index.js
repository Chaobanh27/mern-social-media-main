import toast from 'react-hot-toast'
import authorizedAxiosInstance from '~/utils/authorizedAxios'


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

export const getFeedAPI = async () => {
  const response = await authorizedAxiosInstance.get('/v1/posts')
  return response.data
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

// export const createNewConversationAPI = async (data) => {
//   const res = await authorizedAxiosInstance.post('/v1/conversations/', data)
//   return res.data
// }

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