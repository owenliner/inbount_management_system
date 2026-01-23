import { apiClient, ApiResponse } from './client'

export interface Notification {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'error'
  is_read: boolean
  create_time: string
}

export interface NotificationListResponse {
  records: Notification[]
  total: number
  unread_count: number
}

export const notificationApi = {
  getList: async (page = 1, size = 10): Promise<ApiResponse<NotificationListResponse>> => {
    const response = await apiClient.get<ApiResponse<NotificationListResponse>>('/notifications', {
      params: { page, size },
    })
    return response.data
  },

  markAsRead: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.put<ApiResponse<null>>(`/notifications/${id}/read`)
    return response.data
  },

  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.put<ApiResponse<null>>('/notifications/read-all')
    return response.data
  },
}
