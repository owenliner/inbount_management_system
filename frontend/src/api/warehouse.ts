import { apiClient, ApiResponse, PaginatedData } from './client'

export interface Warehouse {
  id: number
  code: string
  name: string
  principal: string | null
  contact: string | null
  address: string | null
  content: string | null
  create_date: string | null
}

export interface WarehouseCreateParams {
  name: string
  principal?: string
  contact?: string
  address?: string
  content?: string
}

export interface WarehouseUpdateParams {
  name?: string
  principal?: string
  contact?: string
  address?: string
  content?: string
}

export const warehouseApi = {
  getList: async (params: {
    page?: number
    size?: number
    name?: string
  }): Promise<ApiResponse<PaginatedData<Warehouse>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedData<Warehouse>>>('/warehouses', {
      params,
    })
    return response.data
  },

  getAll: async (): Promise<ApiResponse<{ id: number; code: string; name: string }[]>> => {
    const response = await apiClient.get<
      ApiResponse<{ id: number; code: string; name: string }[]>
    >('/warehouses/list')
    return response.data
  },

  getById: async (id: number): Promise<ApiResponse<Warehouse>> => {
    const response = await apiClient.get<ApiResponse<Warehouse>>(`/warehouses/${id}`)
    return response.data
  },

  create: async (params: WarehouseCreateParams): Promise<ApiResponse<{ id: number }>> => {
    const response = await apiClient.post<ApiResponse<{ id: number }>>('/warehouses', params)
    return response.data
  },

  update: async (id: number, params: WarehouseUpdateParams): Promise<ApiResponse<null>> => {
    const response = await apiClient.put<ApiResponse<null>>(`/warehouses/${id}`, params)
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/warehouses/${id}`)
    return response.data
  },
}
