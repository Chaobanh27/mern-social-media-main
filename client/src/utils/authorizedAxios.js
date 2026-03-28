import axios from 'axios'
import toast from 'react-hot-toast'

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:3000'

const authorizedAxiosInstance = axios.create({
  baseURL: API_ROOT,
  timeout: 1000 * 60 * 10,
  withCredentials : true
})

let getTokenFunc = null
export const injectStore = (getClerkToken) => {
  getTokenFunc = getClerkToken
}

authorizedAxiosInstance.interceptors.request.use( async (config) => {
  if (!config.url.includes('cloudinary.com') && getTokenFunc) {
    const token = await getTokenFunc()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
}, error => {
  return Promise.reject(error)
})


authorizedAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Kiểm tra nếu lỗi này là do chủ động Hủy (Cancel)
    if (axios.isCancel(error)) {
      toast.error(error.message)
      // Trả về một Promise không bao giờ hoàn thành hoặc reject đặc biệt
      // để tránh nhảy vào khối catch của UI nếu muốn,
      // nhưng thông thường ta cứ reject để UI biết là đã dừng.
      return Promise.reject(error)
    }
    const status = error.response?.status
    const message = error.response?.data?.message || 'Something went wrong'
    if (status === 401) {
      toast.error('Unauthorized - Clerk session invalid')
    }

    if (status && status !== 401) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default authorizedAxiosInstance