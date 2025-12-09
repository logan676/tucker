import api from './api'
import type { Product, PaginatedResult } from '@/types'

export interface QueryProductsParams {
  page?: number
  pageSize?: number
  merchantId?: string
  keyword?: string
  isAvailable?: boolean
}

export interface CreateProductRequest {
  merchantId: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  image?: string
  categoryId?: string
  isAvailable?: boolean
  isRecommend?: boolean
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  price?: number
  originalPrice?: number
  image?: string
  categoryId?: string
  isAvailable?: boolean
  isRecommend?: boolean
}

export const productsApi = {
  getList: (params: QueryProductsParams) =>
    api.get<unknown, PaginatedResult<Product>>('/admin/products', { params }),

  getById: (id: string) =>
    api.get<unknown, Product>(`/admin/products/${id}`),

  create: (data: CreateProductRequest) =>
    api.post<unknown, Product>('/admin/products', data),

  update: (id: string, data: UpdateProductRequest) =>
    api.patch<unknown, Product>(`/admin/products/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/products/${id}`),

  toggleAvailability: (id: string, isAvailable: boolean) =>
    api.patch<unknown, Product>(`/admin/products/${id}/availability`, { isAvailable }),
}
