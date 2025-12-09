import api from './api'
import type { Order, PaginatedResult } from '@/types'

export interface QueryOrdersParams {
  page?: number
  pageSize?: number
  status?: string
}

export const ordersApi = {
  getList: (params: QueryOrdersParams) =>
    api.get<unknown, PaginatedResult<Order>>('/orders', { params }),

  getById: (id: string) =>
    api.get<unknown, Order>(`/orders/${id}`),
}
