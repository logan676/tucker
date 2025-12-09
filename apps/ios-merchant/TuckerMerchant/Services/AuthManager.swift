import Foundation
import SwiftUI

@MainActor
class AuthManager: ObservableObject {
    static let shared = AuthManager()

    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let tokenKey = "auth_token"
    private let userKey = "auth_user"

    private init() {
        loadStoredAuth()
    }

    private func loadStoredAuth() {
        if let token = UserDefaults.standard.string(forKey: tokenKey) {
            APIService.shared.setToken(token)

            if let userData = UserDefaults.standard.data(forKey: userKey),
               let user = try? JSONDecoder().decode(User.self, from: userData) {
                self.currentUser = user
                self.isAuthenticated = true
            }
        }
    }

    func sendCode(phone: String) async throws {
        isLoading = true
        errorMessage = nil

        do {
            try await APIService.shared.sendSmsCode(phone: phone)
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            throw error
        }
    }

    func login(phone: String, code: String) async throws {
        isLoading = true
        errorMessage = nil

        do {
            let response = try await APIService.shared.login(phone: phone, code: code)

            // Check if user has merchant role
            if response.user.role != "merchant" && response.user.role != "admin" {
                isLoading = false
                errorMessage = "Access denied. This app is for merchants only."
                throw APIError.forbidden
            }

            // Store credentials
            UserDefaults.standard.set(response.accessToken, forKey: tokenKey)
            if let userData = try? JSONEncoder().encode(response.user) {
                UserDefaults.standard.set(userData, forKey: userKey)
            }

            // Update API service
            APIService.shared.setToken(response.accessToken)

            // Update state
            self.currentUser = response.user
            self.isAuthenticated = true
            isLoading = false
        } catch {
            isLoading = false
            if let apiError = error as? APIError {
                errorMessage = apiError.errorDescription
            } else {
                errorMessage = error.localizedDescription
            }
            throw error
        }
    }

    func logout() {
        UserDefaults.standard.removeObject(forKey: tokenKey)
        UserDefaults.standard.removeObject(forKey: userKey)
        APIService.shared.setToken(nil)

        self.currentUser = nil
        self.isAuthenticated = false
    }
}
