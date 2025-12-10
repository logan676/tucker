import Foundation

struct Category: Codable, Identifiable {
    let id: String
    let name: String
    let icon: String?
    let sortOrder: Int
    let isActive: Bool
    let createdAt: String?
}

struct Merchant: Codable, Identifiable {
    let id: String
    let name: String
    let logo: String?
    let banner: String?
    let description: String?
    let category: String?
    let rating: Double
    let ratingCount: Int?
    let monthlySales: Int
    let minOrderAmount: Double
    let deliveryFee: Double
    let deliveryTime: String?
    let distance: String?
    let features: [String]?
    let status: String?

    var isOpen: Bool {
        status == "open"
    }
}

struct Product: Codable, Identifiable {
    let id: String
    let merchantId: String
    let categoryId: String?
    let name: String
    let description: String?
    let image: String?
    let price: Double
    let originalPrice: Double?
    let monthlySales: Int
    let isAvailable: Bool
    let isRecommend: Bool
}

struct ProductCategory: Codable, Identifiable {
    let id: String
    let name: String
    let products: [Product]
}

struct MenuResponse: Codable {
    let categories: [ProductCategory]
}

struct Order: Codable, Identifiable {
    let id: String
    let orderNo: String
    let merchantId: String
    let merchantName: String?
    let totalAmount: Double
    let deliveryFee: Double
    let discountAmount: Double
    let payAmount: Double
    let status: String
    let deliveryAddress: DeliveryAddress?
    let items: [OrderItem]?
    let createdAt: String
    let paidAt: String?
}

struct DeliveryAddress: Codable {
    let name: String
    let phone: String
    let province: String
    let city: String
    let district: String
    let detail: String
}

struct OrderItem: Codable, Identifiable {
    let id: String
    let productId: String
    let productName: String
    let price: Double
    let quantity: Int
    let image: String?
}

struct Address: Codable, Identifiable {
    let id: String
    let label: String?
    let name: String
    let phone: String
    let province: String
    let city: String
    let district: String
    let detail: String
    let isDefault: Bool
}

struct User: Codable, Identifiable {
    let id: String
    let phone: String
    let name: String?
    let avatar: String?
}

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

struct AuthResponse: Codable {
    let accessToken: String
    let user: User
}
