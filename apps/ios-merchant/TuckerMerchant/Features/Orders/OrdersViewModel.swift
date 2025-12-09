import Foundation

@MainActor
class OrdersViewModel: ObservableObject {
    @Published var orders: [Order] = []
    @Published var isLoading = false
    @Published var error: String?

    func loadOrders(status: OrderStatus? = nil) {
        isLoading = true
        error = nil

        Task {
            do {
                let response = try await APIService.shared.getMerchantOrders(status: status)
                self.orders = response.items
            } catch {
                self.error = error.localizedDescription
            }
            isLoading = false
        }
    }
}
