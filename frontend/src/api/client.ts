import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

const API_BASE_URL = '/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError<{ detail?: string; msg?: string }>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    const message = error.response?.data?.detail || error.response?.data?.msg || 'Request failed'
    return Promise.reject(new Error(message))
  }
)

// Response wrapper type
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

export interface PaginatedData<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}
