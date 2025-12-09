import api from './api'
import type { Merchant, Category, User, PaginatedResult } from '@/types'

export interface DashboardStats {
  totalUsers: number
  totalMerchants: number
  totalOrders: number
  totalRevenue: number
  todayOrders: number
  todayRevenue: number
  pendingMerchants: number
  activeOrders: number
}

export interface QueryParams {
  page?: number
  pageSize?: number
  keyword?: string
}

export interface CreateMerchantDto {
  name: string
  logo?: string
  banner?: string
  categoryId?: string
  description?: string
  phone?: string
  minOrderAmount?: number
  deliveryFee?: number
  deliveryTime?: string
  province?: string
  city?: string
  district?: string
  address?: string
  longitude?: number
  latitude?: number
  features?: string[]
  status?: string
  isOpen?: boolean
}

export interface CreateCategoryDto {
  name: string
  icon?: string
  sortOrder?: number
  isActive?: boolean
}

export const adminApi = {
  // Dashboard
  getDashboardStats: () =>
    api.get<unknown, DashboardStats>('/admin/dashboard/stats'),

  // Users
  getUsers: (params: QueryParams) =>
    api.get<unknown, PaginatedResult<User>>('/admin/users', { params }),

  // Merchants
  getMerchants: (params: QueryParams) =>
    api.get<unknown, PaginatedResult<Merchant>>('/admin/merchants', { params }),

  createMerchant: (data: CreateMerchantDto) =>
    api.post<unknown, Merchant>('/admin/merchants', data),

  updateMerchant: (id: string, data: Partial<CreateMerchantDto>) =>
    api.put<unknown, Merchant>(`/admin/merchants/${id}`, data),

  deleteMerchant: (id: string) =>
    api.delete(`/admin/merchants/${id}`),

  // Categories
  getCategories: () =>
    api.get<unknown, Category[]>('/admin/categories'),

  createCategory: (data: CreateCategoryDto) =>
    api.post<unknown, Category>('/admin/categories', data),

  updateCategory: (id: string, data: Partial<CreateCategoryDto>) =>
    api.put<unknown, Category>(`/admin/categories/${id}`, data),

  deleteCategory: (id: string) =>
    api.delete(`/admin/categories/${id}`),
}
