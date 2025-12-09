export interface User {
  id: string
  phone: string
  name: string | null
  avatar: string | null
  membershipLevel: number
  createdAt: string
  updatedAt: string
}

export interface Merchant {
  id: string
  name: string
  logo: string | null
  banner: string | null
  categoryId: string | null
  description: string | null
  phone: string | null
  rating: number
  ratingCount: number
  monthlySales: number
  minOrderAmount: number
  deliveryFee: number
  deliveryTime: string | null
  province: string | null
  city: string | null
  district: string | null
  address: string | null
  status: 'pending' | 'active' | 'suspended' | 'closed'
  isOpen: boolean
  createdAt: string
  updatedAt: string
  category?: Category
}

export interface Category {
  id: string
  name: string
  icon: string | null
  sortOrder: number
  isActive: boolean
}

export interface Product {
  id: string
  merchantId: string
  categoryId: string | null
  name: string
  description: string | null
  image: string | null
  price: number
  originalPrice: number | null
  monthlySales: number
  isAvailable: boolean
  isRecommend: boolean
}

export interface Order {
  id: string
  orderNo: string
  userId: string
  merchantId: string
  totalAmount: number
  deliveryFee: number
  discountAmount: number
  payAmount: number
  status: OrderStatus
  remark: string | null
  createdAt: string
  user?: User
  merchant?: Merchant
  items?: OrderItem[]
}

export type OrderStatus =
  | 'pending_payment'
  | 'pending_confirm'
  | 'confirmed'
  | 'preparing'
  | 'delivering'
  | 'completed'
  | 'cancelled'
  | 'refunded'

export interface OrderItem {
  id: string
  productId: string
  name: string
  image: string | null
  price: number
  quantity: number
  options: string[] | null
}

export interface PaginatedResult<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
