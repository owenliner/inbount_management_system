import { apiClient, ApiResponse, PaginatedData } from './client'

export interface StockItem {
  id: number
  name: string
  type: string | null
  type_id: number | null
  type_name: string | null
  amount: number
  unit: string | null
  price: number
  stock_id: number | null
  storehouse_name: string | null
  create_date: string | null
}

export interface StockDetailItem extends StockItem {
  is_in: number
  status_text: string
}

export const stockApi = {
  getList: async (params: {
    page?: number
    size?: number
    name?: string
    type_id?: number
    stock_id?: number
  }): Promise<ApiResponse<PaginatedData<StockItem>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedData<StockItem>>>('/stock', {
      params,
    })
    return response.data
  },

  getDetail: async (params: {
    page?: number
    size?: number
    name?: string
    type_id?: number
    is_in?: number
  }): Promise<ApiResponse<PaginatedData<StockDetailItem>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedData<StockDetailItem>>>(
      '/stock/detail',
      { params }
    )
    return response.data
  },

  getSummary: async (stock_id?: number): Promise<ApiResponse<StockItem[]>> => {
    const response = await apiClient.get<ApiResponse<StockItem[]>>('/stock/summary', {
      params: { stock_id },
    })
    return response.data
  },

  getById: async (id: number): Promise<ApiResponse<StockItem>> => {
    const response = await apiClient.get<ApiResponse<StockItem>>(`/stock/${id}`)
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/stock/${id}`)
    return response.data
  },
}
