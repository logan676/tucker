import api from './api'

export interface MerchantApplication {
  id: string
  userId: string
  businessName: string
  description: string | null
  logo: string | null
  banner: string | null
  categoryId: string | null
  contactName: string
  contactPhone: string
  contactEmail: string | null
  province: string
  city: string
  district: string
  address: string
  longitude: number | null
  latitude: number | null
  abn: string
  abnCertificateImage: string | null
  foodSafetyCertNumber: string | null
  foodSafetyCertImage: string | null
  ownerName: string | null
  ownerIdImage: string | null
  bankAccountName: string | null
  bsb: string | null
  accountNumber: string | null
  bankName: string | null
  status: ApplicationStatus
  rejectReason: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  submittedAt: string | null
  merchantId: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string | null
    phone: string
  }
  category?: {
    id: string
    name: string
  }
  reviewer?: {
    id: string
    name: string | null
  }
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'

export interface ApplicationReviewLog {
  id: string
  applicationId: string
  actorId: string
  action: string
  fromStatus: string
  toStatus: string
  comment: string | null
  createdAt: string
  actor?: {
    id: string
    name: string | null
    phone: string
  }
}

export interface ApplicationsListResponse {
  items: MerchantApplication[]
  total: number
  page: number
  limit: number
}

export interface ApplicationsQuery {
  status?: ApplicationStatus
  search?: string
  page?: number
  limit?: number
}

export const applicationsApi = {
  getList: (params: ApplicationsQuery): Promise<ApplicationsListResponse> =>
    api.get('/admin/applications', { params }),

  getById: (id: string): Promise<MerchantApplication> =>
    api.get(`/admin/applications/${id}`),

  getPendingCount: (): Promise<{ count: number }> =>
    api.get('/admin/applications/pending-count'),

  getReviewLogs: (id: string): Promise<ApplicationReviewLog[]> =>
    api.get(`/admin/applications/${id}/logs`),

  startReview: (id: string): Promise<MerchantApplication> =>
    api.post(`/admin/applications/${id}/start-review`),

  approve: (id: string): Promise<MerchantApplication> =>
    api.post(`/admin/applications/${id}/approve`),

  reject: (id: string, reason: string): Promise<MerchantApplication> =>
    api.post(`/admin/applications/${id}/reject`, { reason }),
}
