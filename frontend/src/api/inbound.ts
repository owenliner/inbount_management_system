import { apiClient, ApiResponse, PaginatedData } from './client'

export interface InboundRecord {
  id: number
  num: string
  price: number
  custodian: string | null
  put_user: string | null
  content: string | null
  create_date: string | null
}

export interface InboundItem {
  id: number
  name: string
  type: string | null
  type_id: number | null
  amount: number
  unit: string | null
  price: number
}

export interface InboundDetail extends InboundRecord {
  items: InboundItem[]
}

export interface InboundCreateItem {
  name: string
  type?: string
  type_id?: number
  amount: number
  unit?: string
  price: number
}

export interface InboundCreateParams {
  stock_id: number
  custodian: string
  put_user: string
  content?: string
  items: InboundCreateItem[]
}

export const inboundApi = {
  getList: async (params: {
    page?: number
    size?: number
    num?: string
    custodian?: string
  }): Promise<ApiResponse<PaginatedData<InboundRecord>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedData<InboundRecord>>>('/inbound', {
      params,
    })
    return response.data
  },

  getById: async (id: number): Promise<ApiResponse<InboundDetail>> => {
    const response = await apiClient.get<ApiResponse<InboundDetail>>(`/inbound/${id}`)
    return response.data
  },

  create: async (params: InboundCreateParams): Promise<ApiResponse<{ id: number; num: string }>> => {
    const response = await apiClient.post<ApiResponse<{ id: number; num: string }>>(
      '/inbound',
      params
    )
    return response.data
  },

  import: async (
    formData: FormData
  ): Promise<ApiResponse<{ id: number; num: string; items_count: number }>> => {
    const response = await apiClient.post<
      ApiResponse<{ id: number; num: string; items_count: number }>
    >('/inbound/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/inbound/${id}`)
    return response.data
  },
}
