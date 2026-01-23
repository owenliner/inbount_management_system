import { apiClient, ApiResponse } from './client'

export interface OverviewStats {
  inbound_count: number
  month_inbound_count: number
  total_consumption: number
}

export interface DailyStats {
  date: string
  amount: number
}

export interface TypeStats {
  name: string
  value: number
}

export interface LowStockItem {
  id: number
  name: string
  type: string | null
  amount: number
  unit: string | null
}

export interface StockBoard {
  overview: OverviewStats
  daily_inbound: DailyStats[]
  daily_outbound: DailyStats[]
  inbound_by_type: TypeStats[]
  outbound_by_type: TypeStats[]
  low_stock: LowStockItem[]
}

export const dashboardApi = {
  getOverview: async (): Promise<ApiResponse<OverviewStats>> => {
    const response = await apiClient.get<ApiResponse<OverviewStats>>('/dashboard/overview')
    return response.data
  },

  getDailyInbound: async (days?: number): Promise<ApiResponse<DailyStats[]>> => {
    const response = await apiClient.get<ApiResponse<DailyStats[]>>('/dashboard/inbound-daily', {
      params: { days },
    })
    return response.data
  },

  getDailyOutbound: async (days?: number): Promise<ApiResponse<DailyStats[]>> => {
    const response = await apiClient.get<ApiResponse<DailyStats[]>>('/dashboard/outbound-daily', {
      params: { days },
    })
    return response.data
  },

  getInboundByType: async (): Promise<ApiResponse<TypeStats[]>> => {
    const response = await apiClient.get<ApiResponse<TypeStats[]>>('/dashboard/inbound-by-type')
    return response.data
  },

  getOutboundByType: async (): Promise<ApiResponse<TypeStats[]>> => {
    const response = await apiClient.get<ApiResponse<TypeStats[]>>('/dashboard/outbound-by-type')
    return response.data
  },

  getLowStock: async (threshold?: number): Promise<ApiResponse<LowStockItem[]>> => {
    const response = await apiClient.get<ApiResponse<LowStockItem[]>>('/dashboard/low-stock', {
      params: { threshold },
    })
    return response.data
  },

  getBoard: async (): Promise<ApiResponse<StockBoard>> => {
    const response = await apiClient.get<ApiResponse<StockBoard>>('/dashboard/board')
    return response.data
  },
}
