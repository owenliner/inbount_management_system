import { apiClient, ApiResponse } from './client'

export interface UserProfile {
  user_id: number
  username: string
  email: string | null
  mobile: string | null
  status: string
  avatar: string | null
  description: string | null
  ssex: string | null
  roles: string[]
  create_time: string | null
}

export interface UpdateProfileParams {
  email?: string
  mobile?: string
  description?: string
  avatar?: string
}

export interface ChangePasswordParams {
  old_password: string
  new_password: string
}

export const userApi = {
  getProfile: async (userId: number): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>(`/users/${userId}`)
    return response.data
  },

  updateProfile: async (userId: number, data: UpdateProfileParams): Promise<ApiResponse<null>> => {
    const response = await apiClient.put<ApiResponse<null>>(`/users/${userId}`, data)
    return response.data
  },

  changePassword: async (userId: number, data: ChangePasswordParams): Promise<ApiResponse<null>> => {
    const response = await apiClient.put<ApiResponse<null>>(`/users/${userId}/password`, data)
    return response.data
  },
}
