import Foundation

struct CartItem: Identifiable {
    let id = UUID()
    let product: Product
    var quantity: Int
    var selectedOptions: [String: String] // option name -> selected item name
    var optionPrice: Double // additional price from options

    var unitPrice: Double {
        product.price + optionPrice
    }

    var totalPrice: Double {
        unitPrice * Double(quantity)
    }

    // Create unique key for items with same product but different options
    var optionKey: String {
        selectedOptions.sorted(by: { $0.key < $1.key })
            .map { "\($0.key):\($0.value)" }
            .joined(separator: "|")
    }

    init(product: Product, quantity: Int, selectedOptions: [String: String] = [:], optionPrice: Double = 0) {
        self.product = product
        self.quantity = quantity
        self.selectedOptions = selectedOptions
        self.optionPrice = optionPrice
    }
}

class CartManager: ObservableObject {
    @Published var items: [CartItem] = []
    @Published var merchantId: String?

    var totalItems: Int {
        items.reduce(0) { $0 + $1.quantity }
    }

    var totalPrice: Double {
        items.reduce(0) { $0 + $1.totalPrice }
    }

    func addItem(_ product: Product, merchantId newMerchantId: String? = nil) {
        addItemWithOptions(product, merchantId: newMerchantId, quantity: 1, options: [:], optionPrice: 0)
    }

    func addItemWithOptions(
        _ product: Product,
        merchantId newMerchantId: String? = nil,
        quantity: Int,
        options: [String: String],
        optionPrice: Double
    ) {
        let productMerchantId = newMerchantId ?? product.merchantId

        // Check if adding from a different merchant
        if let currentMerchantId = merchantId, currentMerchantId != productMerchantId {
            // Clear cart if different merchant
            items.removeAll()
        }

        merchantId = productMerchantId

        let newItem = CartItem(product: product, quantity: quantity, selectedOptions: options, optionPrice: optionPrice)

        // Find existing item with same product AND same options
        if let index = items.firstIndex(where: {
            $0.product.id == product.id && $0.optionKey == newItem.optionKey
        }) {
            items[index].quantity += quantity
        } else {
            items.append(newItem)
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

    func removeCartItem(_ item: CartItem) {
        if let index = items.firstIndex(where: { $0.id == item.id }) {
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
        items.filter { $0.product.id == productId }.reduce(0) { $0 + $1.quantity }
    }

    func clearCart() {
        items.removeAll()
        merchantId = nil
    }
}
