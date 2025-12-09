import Foundation

struct CartItem: Identifiable {
    let id = UUID()
    let product: Product
    var quantity: Int
}

class CartManager: ObservableObject {
    @Published var items: [CartItem] = []
    @Published var merchantId: String?

    var totalItems: Int {
        items.reduce(0) { $0 + $1.quantity }
    }

    var totalPrice: Double {
        items.reduce(0) { $0 + $1.product.price * Double($1.quantity) }
    }

    func addItem(_ product: Product) {
        // Check if adding from a different merchant
        if let currentMerchantId = merchantId, currentMerchantId != product.merchantId {
            // Clear cart if different merchant
            items.removeAll()
        }

        merchantId = product.merchantId

        if let index = items.firstIndex(where: { $0.product.id == product.id }) {
            items[index].quantity += 1
        } else {
            items.append(CartItem(product: product, quantity: 1))
        }
    }

    func removeItem(_ product: Product) {
        if let index = items.firstIndex(where: { $0.product.id == product.id }) {
            if items[index].quantity > 1 {
                items[index].quantity -= 1
            } else {
                items.remove(at: index)
            }
        }

        if items.isEmpty {
            merchantId = nil
        }
    }

    func getQuantity(for productId: String) -> Int {
        items.first(where: { $0.product.id == productId })?.quantity ?? 0
    }

    func clearCart() {
        items.removeAll()
        merchantId = nil
    }
}
