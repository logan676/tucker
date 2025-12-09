import api from './api'
import type { Merchant, Category, PaginatedResult } from '@/types'

export interface QueryMerchantsParams {
  page?: number
  pageSize?: number
  status?: string
  keyword?: string
}

export const merchantsApi = {
  getList: (params: QueryMerchantsParams) =>
    api.get<unknown, PaginatedResult<Merchant>>('/merchants', { params }),

  getById: (id: string) =>
    api.get<unknown, Merchant>(`/merchants/${id}`),

  getCategories: () =>
    api.get<unknown, Category[]>('/merchants/categories'),

  updateStatus: (id: string, status: Merchant['status']) =>
    api.patch<unknown, Merchant>(`/merchants/${id}/status`, { status }),
}
