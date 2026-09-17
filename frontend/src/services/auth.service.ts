import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
})

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = useAuthStore.getState().refreshToken
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refresh_token: refreshToken
          })
          
          const { access_token, refresh_token: newRefreshToken } = response.data
          
          const currentUser = useAuthStore.getState().user
          if (currentUser) {
            useAuthStore.getState().setAuth(
              currentUser,
              access_token,
              newRefreshToken || refreshToken
            )
          }
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        } catch (refreshError) {
          useAuthStore.getState().logout()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/api/auth/login', { email, password })
    return response.data
  },

  async sendOtp(email: string) {
    const response = await api.post('/api/auth/send-otp', { email })
    return response.data
  },

  async verifyOtp(email: string, otpCode: string, mfaSession?: string) {
    const response = await api.post('/api/auth/verify-otp', {
      email,
      otp_code: otpCode,
      mfa_session: mfaSession,
    })
    return response.data
  },

  async register(email: string, password: string, name: string) {
    const response = await api.post('/api/auth/register', { email, password, name })
    return response.data
  },

  async logout() {
    const response = await api.post('/api/auth/logout')
    return response.data
  },

  async refreshToken(refreshToken: string) {
    const response = await api.post('/api/auth/refresh', { refresh_token: refreshToken })
    return response.data
  },

  async getProfile(token: string) {
    const response = await api.get('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },
}

export default api
