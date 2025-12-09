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
}

struct EmptyResponse: Codable {}
