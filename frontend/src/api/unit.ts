import { apiClient, ApiResponse, PaginatedData } from './client'

export interface Unit {
  id: number
  name: string
  remark: string | null
  create_date: string | null
}

export interface UnitCreateParams {
  name: string
  remark?: string
}

export interface UnitUpdateParams {
  name?: string
  remark?: string
}

export const unitApi = {
  getList: async (params: {
    page?: number
    size?: number
    name?: string
  }): Promise<ApiResponse<PaginatedData<Unit>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedData<Unit>>>('/units', { params })
    return response.data
  },

  getAll: async (): Promise<ApiResponse<{ id: number; name: string }[]>> => {
    const response = await apiClient.get<ApiResponse<{ id: number; name: string }[]>>('/units/list')
    return response.data
  },

  getById: async (id: number): Promise<ApiResponse<Unit>> => {
    const response = await apiClient.get<ApiResponse<Unit>>(`/units/${id}`)
    return response.data
  },

  create: async (params: UnitCreateParams): Promise<ApiResponse<{ id: number }>> => {
    const response = await apiClient.post<ApiResponse<{ id: number }>>('/units', params)
    return response.data
  },

  update: async (id: number, params: UnitUpdateParams): Promise<ApiResponse<null>> => {
    const response = await apiClient.put<ApiResponse<null>>(`/units/${id}`, params)
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/units/${id}`)
    return response.data
  },
}
