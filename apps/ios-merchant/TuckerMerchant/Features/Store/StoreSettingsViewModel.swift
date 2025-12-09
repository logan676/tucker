import Foundation

@MainActor
class StoreSettingsViewModel: ObservableObject {
    @Published var merchant: Merchant?
    @Published var isLoading = false
    @Published var error: String?

    func loadSettings() {
        isLoading = true
        error = nil

        Task {
            do {
                self.merchant = try await APIService.shared.getStoreSettings()
            } catch {
                self.error = error.localizedDescription
            }
            isLoading = false
        }
    }
}
