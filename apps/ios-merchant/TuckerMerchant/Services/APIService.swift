import Foundation

enum APIError: Error, LocalizedError {
    case invalidURL
    case noData
    case decodingError
    case unauthorized
    case forbidden
    case serverError(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .noData: return "No data received"
        case .decodingError: return "Failed to decode response"
        case .unauthorized: return "Unauthorized"
        case .forbidden: return "Access denied"
        case .serverError(let message): return message
        }
    }
}

class APIService {
    static let shared = APIService()

    private let baseURL = "http://localhost:3000/api/v1"
    private var token: String?

    private init() {}

    func setToken(_ token: String?) {
        self.token = token
    }

    private func makeRequest<T: Codable>(
        path: String,
        method: String = "GET",
        body: Data? = nil
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(path)") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            request.httpBody = body
        }

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.serverError("Invalid response")
        }

        if httpResponse.statusCode == 401 {
            throw APIError.unauthorized
        }

        if httpResponse.statusCode == 403 {
            throw APIError.forbidden
        }

        if httpResponse.statusCode >= 400 {
            throw APIError.serverError("Server error: \(httpResponse.statusCode)")
        }

        do {
            let decoder = JSONDecoder()
            return try decoder.decode(T.self, from: data)
        } catch {
            print("Decoding error: \(error)")
            throw APIError.decodingError
        }
    }

    // MARK: - Auth

    func sendSmsCode(phone: String) async throws {
        struct Request: Codable { let phone: String }
        let body = try JSONEncoder().encode(Request(phone: phone))
        let _: EmptyResponse = try await makeRequest(path: "/auth/sms/send", method: "POST", body: body)
    }

    func login(phone: String, code: String) async throws -> AuthResponse {
        struct Request: Codable { let phone: String; let code: String }
        let body = try JSONEncoder().encode(Request(phone: phone, code: code))
        return try await makeRequest(path: "/auth/login/phone", method: "POST", body: body)
    }

    // MARK: - Merchant Dashboard

    func getDashboardStats() async throws -> DashboardStats {
        return try await makeRequest(path: "/merchant/dashboard")
    }

    // MARK: - Merchant Orders

    func getMerchantOrders(page: Int = 1, pageSize: Int = 20, status: OrderStatus? = nil) async throws -> PaginatedResponse<Order> {
        var path = "/merchant/orders?page=\(page)&pageSize=\(pageSize)"
        if let status = status {
            path += "&status=\(status.rawValue)"
        }
        return try await makeRequest(path: path)
    }

    func getMerchantOrder(id: String) async throws -> Order {
        return try await makeRequest(path: "/merchant/orders/\(id)")
    }

    func updateOrderStatus(orderId: String, status: OrderStatus, reason: String? = nil) async throws -> Order {
        struct Request: Codable {
            let status: String
            let reason: String?
        }
        let body = try JSONEncoder().encode(Request(status: status.rawValue, reason: reason))
        return try await makeRequest(path: "/merchant/orders/\(orderId)/status", method: "PUT", body: body)
    }

    // MARK: - Merchant Products

    func getMerchantProducts() async throws -> [Product] {
        return try await makeRequest(path: "/merchant/products")
    }

    func getMerchantProduct(id: String) async throws -> Product {
        return try await makeRequest(path: "/merchant/products/\(id)")
    }

    func createProduct(
        name: String,
        description: String?,
        price: Double,
        originalPrice: Double?,
        image: String?,
        categoryId: String?,
        isAvailable: Bool
    ) async throws -> Product {
        struct Request: Codable {
            let name: String
            let description: String?
            let price: Double
            let originalPrice: Double?
            let image: String?
            let categoryId: String?
            let isAvailable: Bool
        }
        let body = try JSONEncoder().encode(Request(
            name: name,
            description: description,
            price: price,
            originalPrice: originalPrice,
            image: image,
            categoryId: categoryId,
            isAvailable: isAvailable
        ))
        return try await makeRequest(path: "/merchant/products", method: "POST", body: body)
    }

    func updateProduct(
        id: String,
        name: String?,
        description: String?,
        price: Double?,
        originalPrice: Double?,
        image: String?,
        categoryId: String?,
        isAvailable: Bool?
    ) async throws -> Product {
        struct Request: Codable {
            let name: String?
            let description: String?
            let price: Double?
            let originalPrice: Double?
            let image: String?
            let categoryId: String?
            let isAvailable: Bool?
        }
        let body = try JSONEncoder().encode(Request(
            name: name,
            description: description,
            price: price,
            originalPrice: originalPrice,
            image: image,
            categoryId: categoryId,
            isAvailable: isAvailable
        ))
        return try await makeRequest(path: "/merchant/products/\(id)", method: "PUT", body: body)
    }

    func deleteProduct(id: String) async throws {
        struct Response: Codable { let success: Bool }
        let _: Response = try await makeRequest(path: "/merchant/products/\(id)", method: "DELETE")
    }

    func toggleProductAvailability(id: String, isAvailable: Bool) async throws -> Product {
        struct Request: Codable { let isAvailable: Bool }
        let body = try JSONEncoder().encode(Request(isAvailable: isAvailable))
        return try await makeRequest(path: "/merchant/products/\(id)/availability", method: "PUT", body: body)
    }

    // MARK: - Store Settings

    func getStoreSettings() async throws -> Merchant {
        return try await makeRequest(path: "/merchant/store")
    }

    func updateStoreSettings(
        name: String?,
        description: String?,
        logo: String?,
        banner: String?,
        phone: String?,
        address: String?,
        deliveryFee: Double?,
        deliveryTime: String?,
        minOrderAmount: Double?
    ) async throws -> Merchant {
        struct Request: Codable {
            let name: String?
            let description: String?
            let logo: String?
            let banner: String?
            let phone: String?
            let address: String?
            let deliveryFee: Double?
            let deliveryTime: String?
            let minOrderAmount: Double?
        }
        let body = try JSONEncoder().encode(Request(
            name: name,
            description: description,
            logo: logo,
            banner: banner,
            phone: phone,
            address: address,
            deliveryFee: deliveryFee,
            deliveryTime: deliveryTime,
            minOrderAmount: minOrderAmount
        ))
        return try await makeRequest(path: "/merchant/store", method: "PUT", body: body)
    }

    func toggleStoreOpen(isOpen: Bool) async throws -> Merchant {
        struct Request: Codable { let isOpen: Bool }
        let body = try JSONEncoder().encode(Request(isOpen: isOpen))
        return try await makeRequest(path: "/merchant/store/open", method: "PUT", body: body)
    }
}
