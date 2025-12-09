import api from './api'
import type { User, PaginatedResult } from '@/types'

export interface QueryUsersParams {
  page?: number
  pageSize?: number
  keyword?: string
}

export const usersApi = {
  getList: (params: QueryUsersParams) =>
    api.get<unknown, PaginatedResult<User>>('/users', { params }),

  getById: (id: string) =>
    api.get<unknown, User>(`/users/${id}`),
}
