import api from './api'
import type { Coupon, UserCoupon, PaginatedResult } from '@/types'

export interface QueryCouponsParams {
  page?: number
  pageSize?: number
  isActive?: boolean
  keyword?: string
}

export interface CreateCouponRequest {
  code: string
  name: string
  description?: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  startDate: string
  endDate: string
  usageLimit?: number
  isActive?: boolean
}

export interface UpdateCouponRequest {
  code?: string
  name?: string
  description?: string
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  startDate?: string
  endDate?: string
  usageLimit?: number
  isActive?: boolean
}

export interface QueryUserCouponsParams {
  page?: number
  pageSize?: number
  couponId?: string
  userId?: string
  used?: boolean
}

export const couponsApi = {
  getList: (params: QueryCouponsParams) =>
    api.get<unknown, PaginatedResult<Coupon>>('/admin/coupons', { params }),

  getById: (id: string) =>
    api.get<unknown, Coupon>(`/admin/coupons/${id}`),

  create: (data: CreateCouponRequest) =>
    api.post<unknown, Coupon>('/admin/coupons', data),

  update: (id: string, data: UpdateCouponRequest) =>
    api.patch<unknown, Coupon>(`/admin/coupons/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/coupons/${id}`),

  toggleActive: (id: string, isActive: boolean) =>
    api.patch<unknown, Coupon>(`/admin/coupons/${id}/active`, { isActive }),

  getUserCoupons: (params: QueryUserCouponsParams) =>
    api.get<unknown, PaginatedResult<UserCoupon>>('/admin/coupons/users', { params }),

  issueCoupon: (couponId: string, userIds: string[]) =>
    api.post('/admin/coupons/issue', { couponId, userIds }),
}
