import { apiClient, ApiResponse, PaginatedData } from './client'

export interface ConsumableType {
  id: number
  name: string
  code: string | null
  remark: string | null
  create_date: string | null
}

export interface ConsumableTypeCreateParams {
  name: string
  code?: string
  remark?: string
}

export interface ConsumableTypeUpdateParams {
  name?: string
  code?: string
  remark?: string
}

export const consumableTypeApi = {
  getList: async (params: {
    page?: number
    size?: number
    name?: string
  }): Promise<ApiResponse<PaginatedData<ConsumableType>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedData<ConsumableType>>>(
      '/consumable-types',
      { params }
    )
    return response.data
  },

  getAll: async (): Promise<ApiResponse<{ id: number; name: string; code: string | null }[]>> => {
    const response = await apiClient.get<
      ApiResponse<{ id: number; name: string; code: string | null }[]>
    >('/consumable-types/list')
    return response.data
  },

  getById: async (id: number): Promise<ApiResponse<ConsumableType>> => {
    const response = await apiClient.get<ApiResponse<ConsumableType>>(`/consumable-types/${id}`)
    return response.data
  },

  create: async (params: ConsumableTypeCreateParams): Promise<ApiResponse<{ id: number }>> => {
    const response = await apiClient.post<ApiResponse<{ id: number }>>('/consumable-types', params)
    return response.data
  },

  update: async (id: number, params: ConsumableTypeUpdateParams): Promise<ApiResponse<null>> => {
    const response = await apiClient.put<ApiResponse<null>>(`/consumable-types/${id}`, params)
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/consumable-types/${id}`)
    return response.data
  },
}
