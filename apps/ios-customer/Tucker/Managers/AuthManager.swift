import Foundation

class AuthManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var error: String?

    private let tokenKey = "auth_token"

    init() {
        if let token = UserDefaults.standard.string(forKey: tokenKey) {
            APIService.shared.setToken(token)
            isAuthenticated = true
            loadUserProfile()
        }
    }

    func sendCode(phone: String) async {
        await MainActor.run { isLoading = true; error = nil }

        do {
            try await APIService.shared.sendSmsCode(phone: phone)
            await MainActor.run { isLoading = false }
        } catch {
            await MainActor.run {
                self.error = error.localizedDescription
                isLoading = false
            }
        }
    }

    func login(phone: String, code: String) async {
        await MainActor.run { isLoading = true; error = nil }

        do {
            let response = try await APIService.shared.login(phone: phone, code: code)
            UserDefaults.standard.set(response.accessToken, forKey: tokenKey)
            APIService.shared.setToken(response.accessToken)

            await MainActor.run {
                currentUser = response.user
                isAuthenticated = true
                isLoading = false
            }
        } catch {
            await MainActor.run {
                self.error = error.localizedDescription
                isLoading = false
            }
        }
    }

    func logout() {
        UserDefaults.standard.removeObject(forKey: tokenKey)
        APIService.shared.setToken(nil)
        currentUser = nil
        isAuthenticated = false
    }

    private func loadUserProfile() {
        Task {
            do {
                let user = try await APIService.shared.getUserProfile()
                await MainActor.run { currentUser = user }
            } catch {
                await MainActor.run { logout() }
            }
        }
    }
}
