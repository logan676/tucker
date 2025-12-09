import Foundation

enum APIError: Error {
    case invalidURL
    case noData
    case decodingError
    case unauthorized
    case serverError(String)
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

    // MARK: - Merchants

    func getCategories() async throws -> [Category] {
        return try await makeRequest(path: "/merchants/categories")
    }

    func getMerchants(page: Int = 1, pageSize: Int = 20) async throws -> PaginatedResponse<Merchant> {
        return try await makeRequest(path: "/merchants?page=\(page)&pageSize=\(pageSize)")
    }

    func getMerchant(id: String) async throws -> Merchant {
        return try await makeRequest(path: "/merchants/\(id)")
    }

    func getMerchantMenu(merchantId: String) async throws -> MenuResponse {
        return try await makeRequest(path: "/merchants/\(merchantId)/products")
    }

    // MARK: - Orders

    func getOrders(page: Int = 1, pageSize: Int = 20) async throws -> PaginatedResponse<Order> {
        return try await makeRequest(path: "/orders?page=\(page)&pageSize=\(pageSize)")
    }

    func getOrder(id: String) async throws -> Order {
        return try await makeRequest(path: "/orders/\(id)")
    }

    // MARK: - User

    func getUserProfile() async throws -> User {
        return try await makeRequest(path: "/users/me")
    }

    // MARK: - Addresses

    func getAddresses() async throws -> [Address] {
        return try await makeRequest(path: "/users/me/addresses")
    }

    func createAddress(
        label: String?,
        name: String,
        phone: String,
        province: String,
        city: String,
        district: String,
        detail: String,
        isDefault: Bool
    ) async throws -> Address {
        struct Request: Codable {
            let label: String?
            let name: String
            let phone: String
            let province: String
            let city: String
            let district: String
            let detail: String
            let isDefault: Bool
        }
        let body = try JSONEncoder().encode(Request(
            label: label,
            name: name,
            phone: phone,
            province: province,
            city: city,
            district: district,
            detail: detail,
            isDefault: isDefault
        ))
        return try await makeRequest(path: "/users/me/addresses", method: "POST", body: body)
    }

    // MARK: - Orders

    func createOrder(
        merchantId: String,
        addressId: String,
        items: [OrderItemRequest],
        remark: String?
    ) async throws -> CreateOrderResponse {
        struct Request: Codable {
            let merchantId: String
            let addressId: String
            let items: [OrderItemRequest]
            let remark: String?
        }
        let body = try JSONEncoder().encode(Request(
            merchantId: merchantId,
            addressId: addressId,
            items: items,
            remark: remark
        ))
        return try await makeRequest(path: "/orders", method: "POST", body: body)
    }

    // MARK: - Payments

    func createPayment(orderId: String, method: String) async throws -> PaymentResponse {
        struct Request: Codable {
            let orderId: String
            let method: String
        }
        let body = try JSONEncoder().encode(Request(orderId: orderId, method: method))
        return try await makeRequest(path: "/payments", method: "POST", body: body)
    }

    func mockPayment(paymentId: String) async throws {
        let _: MockPaymentResponse = try await makeRequest(path: "/payments/\(paymentId)/mock-pay?success=true")
    }
}

struct EmptyResponse: Codable {}

struct OrderItemRequest: Codable {
    let productId: String
    let quantity: Int
}

struct CreateOrderResponse: Codable {
    let orderId: String
    let orderNo: String
    let totalAmount: Double
    let deliveryFee: Double
    let discountAmount: Double
    let payAmount: Double
    let payExpireAt: String
}

struct PaymentResponse: Codable {
    let paymentId: String
    let orderId: String
    let amount: Double
    let method: String
    let paymentUrl: String
    let expireAt: String
}

struct MockPaymentResponse: Codable {
    let message: String
    let status: String
}
