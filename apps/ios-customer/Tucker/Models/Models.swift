import Foundation

struct Category: Codable, Identifiable {
    let id: String
    let name: String
    let icon: String?
    let sortOrder: Int
    let isActive: Bool
    let createdAt: String?
}

struct BannerItem: Codable, Identifiable {
    let id: String
    let title: String
    let subtitle: String?
    let imageUrl: String
    let type: String
    let actionType: String?
    let actionValue: String?
    let sortOrder: Int
    let isActive: Bool
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
    let distance: Int?
    let features: [String]?
    let status: String?

    var isOpen: Bool {
        status == "open"
    }

    var distanceText: String {
        guard let dist = distance else { return "" }
        if dist < 1000 {
            return "\(dist)m"
        } else {
            return String(format: "%.1fkm", Double(dist) / 1000.0)
        }
    }
}

struct ProductOptionItem: Codable {
    let name: String
    let price: Double
}

struct ProductOption: Codable, Identifiable {
    var id: String { name }
    let name: String
    let required: Bool
    let items: [ProductOptionItem]
}

struct Product: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let image: String?
    let images: [String]?
    let price: Double
    let originalPrice: Double?
    let monthlySales: Int
    let likes: Int?
    let isAvailable: Bool
    let options: [ProductOption]?

    // Optional fields that may not always be present
    let merchantId: String?
    let categoryId: String?
    let isRecommend: Bool?

    var hasOptions: Bool {
        guard let options = options else { return false }
        return !options.isEmpty
    }
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

struct Coupon: Codable, Identifiable {
    let id: String
    let code: String
    let name: String
    let description: String?
    let discountType: String  // "percentage" or "fixed"
    let discountValue: Double
    let minOrderAmount: Double
    let maxDiscount: Double?
    let startDate: String
    let endDate: String
    let merchantId: String?
    let status: String

    var discountText: String {
        if discountType == "percentage" {
            return "\(Int(discountValue))% off"
        } else {
            return "$\(Int(discountValue)) off"
        }
    }

    var minOrderText: String {
        if minOrderAmount > 0 {
            return "Min. order $\(Int(minOrderAmount))"
        }
        return "No minimum"
    }
}

struct ValidateCouponResponse: Codable {
    let valid: Bool
    let coupon: Coupon?
    let discountAmount: Double?
    let message: String?
}

// MARK: - Reviews

struct Review: Codable, Identifiable {
    let id: String
    let userId: String
    let merchantId: String
    let orderId: String?
    let rating: Double
    let content: String?
    let images: [String]?
    let tasteRating: Int
    let packagingRating: Int
    let deliveryRating: Int
    let likes: Int
    let merchantReply: String?
    let replyAt: String?
    let isAnonymous: Bool
    let createdAt: String
    let user: ReviewUser?
}

struct ReviewUser: Codable {
    let id: String
    let name: String?
    let avatar: String?
}

struct ReviewStats: Codable {
    let averageRating: Double
    let totalReviews: Int
    let ratingDistribution: [String: Int]
    let tasteAverage: Double
    let packagingAverage: Double
    let deliveryAverage: Double
}

struct ReviewsResponse: Codable {
    let items: [Review]
    let pagination: Pagination
}

// MARK: - Favorites

struct Favorite: Codable, Identifiable {
    let id: String
    let userId: String
    let merchantId: String
    let merchant: Merchant?
    let createdAt: String
}
