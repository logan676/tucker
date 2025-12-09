import Foundation

struct Category: Codable, Identifiable {
    let id: String
    let name: String
    let icon: String?
    let sortOrder: Int
    let isActive: Bool
}

struct Merchant: Codable, Identifiable {
    let id: String
    let name: String
    let logo: String?
    let banner: String?
    let description: String?
    let rating: Double
    let ratingCount: Int
    let monthlySales: Int
    let minOrderAmount: Double
    let deliveryFee: Double
    let deliveryTime: String?
    let isOpen: Bool
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
    let totalAmount: Double
    let payAmount: Double
    let status: String
    let createdAt: String
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
