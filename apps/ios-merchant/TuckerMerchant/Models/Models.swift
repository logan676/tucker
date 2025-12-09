import Foundation

// MARK: - Auth Models

struct AuthResponse: Codable {
    let accessToken: String
    let refreshToken: String
    let expiresIn: Int
    let user: User
}

struct User: Codable, Identifiable {
    let id: String
    let phone: String
    let name: String?
    let avatar: String?
    let role: String?
}

// MARK: - Dashboard Models

struct DashboardStats: Codable {
    let todayOrders: Int
    let todayRevenue: Double
    let pendingOrders: Int
    let totalOrders: Int
    let totalRevenue: Double
    let averageRating: Double
    let ratingCount: Int
}

// MARK: - Merchant Models

struct Merchant: Codable, Identifiable {
    let id: String
    let name: String
    let logo: String?
    let banner: String?
    let description: String?
    let phone: String?
    let address: String?
    let rating: Double?
    let ratingCount: Int?
    let monthlySales: Int?
    let minOrderAmount: Double?
    let deliveryFee: Double?
    let deliveryTime: String?
    let isOpen: Bool
    let businessHours: [BusinessHour]?
}

struct BusinessHour: Codable {
    let day: Int
    let openTime: String
    let closeTime: String
    let isOpen: Bool
}

// MARK: - Order Models

struct Order: Codable, Identifiable {
    let id: String
    let orderNo: String
    let userId: String?
    let merchantId: String
    let totalAmount: Double
    let deliveryFee: Double
    let discountAmount: Double
    let payAmount: Double
    let status: OrderStatus
    let deliveryAddress: DeliveryAddress?
    let items: [OrderItem]?
    let remark: String?
    let createdAt: String
    let paidAt: String?
    let completedAt: String?
    let cancelledAt: String?
    let cancelReason: String?
}

enum OrderStatus: String, Codable, CaseIterable {
    case pendingPayment = "pending_payment"
    case pendingConfirm = "pending_confirm"
    case preparing = "preparing"
    case ready = "ready"
    case delivering = "delivering"
    case completed = "completed"
    case cancelled = "cancelled"
    case refunded = "refunded"

    var displayName: String {
        switch self {
        case .pendingPayment: return "Pending Payment"
        case .pendingConfirm: return "Pending Confirm"
        case .preparing: return "Preparing"
        case .ready: return "Ready"
        case .delivering: return "Delivering"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        case .refunded: return "Refunded"
        }
    }

    var color: String {
        switch self {
        case .pendingPayment: return "orange"
        case .pendingConfirm: return "blue"
        case .preparing: return "purple"
        case .ready: return "green"
        case .delivering: return "teal"
        case .completed: return "gray"
        case .cancelled, .refunded: return "red"
        }
    }

    var nextStatus: OrderStatus? {
        switch self {
        case .pendingConfirm: return .preparing
        case .preparing: return .ready
        case .ready: return .delivering
        case .delivering: return .completed
        default: return nil
        }
    }
}

struct DeliveryAddress: Codable {
    let name: String
    let phone: String
    let province: String
    let city: String
    let district: String
    let detail: String

    var fullAddress: String {
        "\(province)\(city)\(district)\(detail)"
    }
}

struct OrderItem: Codable, Identifiable {
    let id: String
    let productId: String
    let name: String
    let price: Double
    let quantity: Int
    let image: String?
    let options: [String]?
}

// MARK: - Product Models

struct Product: Codable, Identifiable {
    let id: String
    let merchantId: String
    let categoryId: String?
    let name: String
    let description: String?
    let image: String?
    let price: Double
    let originalPrice: Double?
    let monthlySales: Int?
    let isAvailable: Bool
    let isRecommend: Bool?
    let options: [ProductOption]?
}

struct ProductOption: Codable {
    let name: String
    let values: [String]
}

struct ProductCategory: Codable, Identifiable {
    let id: String
    let name: String
    let sortOrder: Int?
}

// MARK: - Pagination

struct PaginatedResponse<T: Codable>: Codable {
    let items: [T]
    let pagination: Pagination
}

struct Pagination: Codable {
    let page: Int
    let pageSize: Int
    let total: Int
    let totalPages: Int
}

// MARK: - Empty Response

struct EmptyResponse: Codable {}
