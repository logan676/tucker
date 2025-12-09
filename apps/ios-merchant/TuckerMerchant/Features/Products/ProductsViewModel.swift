import Foundation

@MainActor
class ProductsViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var isLoading = false
    @Published var error: String?

    func loadProducts() {
        isLoading = true
        error = nil

        Task {
            do {
                self.products = try await APIService.shared.getMerchantProducts()
            } catch {
                self.error = error.localizedDescription
            }
            isLoading = false
        }
    }

    func toggleAvailability(_ product: Product) {
        Task {
            do {
                let updated = try await APIService.shared.toggleProductAvailability(
                    id: product.id,
                    isAvailable: !product.isAvailable
                )

                if let index = products.firstIndex(where: { $0.id == product.id }) {
                    products[index] = updated
                }
            } catch {
                self.error = error.localizedDescription
            }
        }
    }

    func deleteProduct(_ product: Product) {
        Task {
            do {
                try await APIService.shared.deleteProduct(id: product.id)
                products.removeAll { $0.id == product.id }
            } catch {
                self.error = error.localizedDescription
            }
        }
    }
}
