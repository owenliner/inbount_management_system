import { apiClient, ApiResponse } from './client'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginData {
  token: string
  expire_time: string
  roles: string[]
  permissions: string[]
  user: {
    user_id: number
    username: string
    email: string | null
    mobile: string | null
    status: string
    avatar: string | null
  }
}

export interface UserInfo {
  user_id: number
  username: string
  email: string | null
  mobile: string | null
  status: string
  avatar: string | null
  description: string | null
  roles: string[]
  last_login_time: string | null
}

export const authApi = {
  login: async (params: LoginParams): Promise<ApiResponse<LoginData>> => {
    const formData = new URLSearchParams()
    formData.append('username', params.username)
    formData.append('password', params.password)

    const response = await apiClient.post<ApiResponse<LoginData>>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/logout')
    return response.data
  },

  getCurrentUser: async (): Promise<ApiResponse<UserInfo>> => {
    const response = await apiClient.get<ApiResponse<UserInfo>>('/auth/me')
    return response.data
  },
}
