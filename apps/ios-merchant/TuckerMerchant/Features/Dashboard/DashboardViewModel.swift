import Foundation

@MainActor
class DashboardViewModel: ObservableObject {
    @Published var stats: DashboardStats?
    @Published var merchant: Merchant?
    @Published var isLoading = false
    @Published var error: String?

    func loadData() async {
        isLoading = true
        error = nil

        do {
            async let statsTask = APIService.shared.getDashboardStats()
            async let merchantTask = APIService.shared.getStoreSettings()

            let (loadedStats, loadedMerchant) = try await (statsTask, merchantTask)
            self.stats = loadedStats
            self.merchant = loadedMerchant
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }

    func refresh() async {
        await loadData()
    }

    func toggleStoreOpen() {
        guard let merchant = merchant else { return }

        Task {
            do {
                let updated = try await APIService.shared.toggleStoreOpen(isOpen: !merchant.isOpen)
                self.merchant = updated
            } catch {
                self.error = error.localizedDescription
            }
        }
    }
}
