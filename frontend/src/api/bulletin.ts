import { apiClient, ApiResponse, PaginatedData } from './client'

export interface Bulletin {
  id: number
  title: string
  content: string | null
  author: string | null
  status: number
  create_date: string | null
  update_date: string | null
}

export interface BulletinCreateParams {
  title: string
  content?: string
  author?: string
}

export interface BulletinUpdateParams {
  title?: string
  content?: string
  author?: string
  status?: number
}

export const bulletinApi = {
  getList: async (params: {
    page?: number
    size?: number
    title?: string
    status?: number
  }): Promise<ApiResponse<PaginatedData<Bulletin>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedData<Bulletin>>>('/bulletins', {
      params,
    })
    return response.data
  },

  getActive: async (limit?: number): Promise<ApiResponse<Bulletin[]>> => {
    const response = await apiClient.get<ApiResponse<Bulletin[]>>('/bulletins/active', {
      params: { limit },
    })
    return response.data
  },

  getById: async (id: number): Promise<ApiResponse<Bulletin>> => {
    const response = await apiClient.get<ApiResponse<Bulletin>>(`/bulletins/${id}`)
    return response.data
  },

  create: async (params: BulletinCreateParams): Promise<ApiResponse<{ id: number }>> => {
    const response = await apiClient.post<ApiResponse<{ id: number }>>('/bulletins', params)
    return response.data
  },

  update: async (id: number, params: BulletinUpdateParams): Promise<ApiResponse<null>> => {
    const response = await apiClient.put<ApiResponse<null>>(`/bulletins/${id}`, params)
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/bulletins/${id}`)
    return response.data
  },
}
