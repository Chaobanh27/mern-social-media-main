import toast from 'react-hot-toast'
import authorizedAxiosInstance from '../../utils/authorizedAxios'


export const fetchStatusAPI = async () => {
  const response = await authorizedAxiosInstance.get('/v1/status')
  toast.success('fetch status successfully', { theme: 'colored' })
  return response.data
}

export const fetchMeAPI = async () => {
  const response = await authorizedAxiosInstance.get('/v1/users/me')
  toast.success('fetch user data successfully', { theme: 'colored' })
  return response.data
}

export const testAllUsersAPI = async () => {
  const response = await authorizedAxiosInstance.get('/v1/tests/fetchAllUsers')
  return response.data
}