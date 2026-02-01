import axios from 'axios'
import toast from 'react-hot-toast'
import { API_ROOT } from './constants'

const authorizedAxiosInstance = axios.create({
  baseURL: API_ROOT,
  timeout: 1000 * 60 * 10,
  withCredentials : true
})

authorizedAxiosInstance.interceptors.request.use( async (config) => {
  return config
}, error => {
  return Promise.reject(error)
})


authorizedAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      toast.error('Unauthorized - Clerk session invalid')
    }

    if (status && status !== 401) {
      toast.error(
        error.response?.data?.message || 'Something went wrong'
      )
    }

    return Promise.reject(error)
  }
)

export default authorizedAxiosInstance