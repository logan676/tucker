import SwiftUI

struct ProductOptionsSheet: View {
    let product: Product
    let merchantId: String
    let onAddToCart: (Product, Int, [String: String], Double) -> Void
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var cartManager: CartManager

    @State private var quantity = 1
    @State private var selectedOptions: [String: String] = [:]
    @State private var specialInstructions = ""

    var totalPrice: Double {
        var price = product.price * Double(quantity)
        // Add option prices
        if let options = product.options {
            for option in options {
                if let selectedItem = selectedOptions[option.name],
                   let item = option.items.first(where: { $0.name == selectedItem }) {
                    price += item.price * Double(quantity)
                }
            }
        }
        return price
    }

    var canAddToCart: Bool {
        guard let options = product.options else { return true }
        for option in options where option.required {
            if selectedOptions[option.name] == nil {
                return false
            }
        }
        return true
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    // Product Header
                    productHeader

                    // Options
                    if let options = product.options, !options.isEmpty {
                        optionsSection(options: options)
                    }

                    // Special Instructions
                    specialInstructionsSection

                    // Quantity Selector
                    quantitySection
                }
            }
            .background(Color(.systemGray6))
            .navigationTitle("Customize")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .foregroundColor(.primary)
                    }
                }
            }
            .safeAreaInset(edge: .bottom) {
                addToCartButton
            }
        }
    }

    // MARK: - Product Header
    private var productHeader: some View {
        VStack(spacing: 0) {
            // Image
            AsyncImage(url: URL(string: product.image ?? "")) { image in
                image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle().fill(Color.gray.opacity(0.2))
            }
            .frame(height: 200)
            .clipped()

            // Info
            VStack(alignment: .leading, spacing: 8) {
                Text(product.name)
                    .font(.title3)
                    .fontWeight(.bold)

                if let description = product.description {
                    Text(description)
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }

                HStack {
                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text("$")
                            .font(.subheadline)
                        Text(String(format: "%.2f", product.price))
                            .font(.title2)
                            .fontWeight(.bold)
                    }
                    .foregroundColor(.red)

                    if let originalPrice = product.originalPrice, originalPrice > product.price {
                        Text("$\(String(format: "%.2f", originalPrice))")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                            .strikethrough()
                    }

                    Spacer()

                    Text("\(product.monthlySales) sold")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
            .padding()
            .background(Color.white)
        }
    }

    // MARK: - Options Section
    private func optionsSection(options: [ProductOption]) -> some View {
        VStack(spacing: 12) {
            ForEach(options) { option in
                VStack(alignment: .leading, spacing: 12) {
                    // Option Header
                    HStack {
                        Text(option.name)
                            .font(.subheadline)
                            .fontWeight(.semibold)

                        if option.required {
                            Text("Required")
                                .font(.caption2)
                                .foregroundColor(.white)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.red)
                                .cornerRadius(4)
                        }

                        Spacer()

                        Text("Select 1")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }

                    // Option Items
                    ForEach(option.items, id: \.name) { item in
                        OptionItemRow(
                            item: item,
                            isSelected: selectedOptions[option.name] == item.name,
                            onSelect: {
                                selectedOptions[option.name] = item.name
                            }
                        )
                    }
                }
                .padding()
                .background(Color.white)
                .cornerRadius(12)
            }
        }
        .padding(.horizontal, 12)
        .padding(.top, 12)
    }

    // MARK: - Special Instructions
    private var specialInstructionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Special Instructions")
                .font(.subheadline)
                .fontWeight(.semibold)

            TextField("Any special requests? (optional)", text: $specialInstructions, axis: .vertical)
                .lineLimit(3...5)
                .padding(12)
                .background(Color(.systemGray6))
                .cornerRadius(8)

            Text("Leave a note for the restaurant")
                .font(.caption)
                .foregroundColor(.gray)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .padding(.horizontal, 12)
        .padding(.top, 12)
    }

    // MARK: - Quantity Section
    private var quantitySection: some View {
        HStack {
            Text("Quantity")
                .font(.subheadline)
                .fontWeight(.semibold)

            Spacer()

            HStack(spacing: 16) {
                Button {
                    if quantity > 1 { quantity -= 1 }
                } label: {
                    Image(systemName: "minus")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(quantity > 1 ? .tuckerOrange : .gray)
                        .frame(width: 32, height: 32)
                        .overlay(
                            Circle()
                                .stroke(quantity > 1 ? Color.tuckerOrange : Color.gray, lineWidth: 1.5)
                        )
                }
                .disabled(quantity <= 1)

                Text("\(quantity)")
                    .font(.headline)
                    .frame(minWidth: 30)

                Button {
                    quantity += 1
                } label: {
                    Image(systemName: "plus")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white)
                        .frame(width: 32, height: 32)
                        .background(Color.tuckerOrange)
                        .clipShape(Circle())
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .padding(.horizontal, 12)
        .padding(.top, 12)
        .padding(.bottom, 100)
    }

    // MARK: - Add to Cart Button
    private var addToCartButton: some View {
        HStack(spacing: 16) {
            // Price
            VStack(alignment: .leading, spacing: 2) {
                Text("Total")
                    .font(.caption)
                    .foregroundColor(.gray)
                HStack(alignment: .firstTextBaseline, spacing: 2) {
                    Text("$")
                        .font(.subheadline)
                    Text(String(format: "%.2f", totalPrice))
                        .font(.title2)
                        .fontWeight(.bold)
                }
            }

            Spacer()

            // Add Button
            Button {
                addToCart()
            } label: {
                Text("Add to Cart")
                    .font(.subheadline)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .frame(width: 160)
                    .padding(.vertical, 14)
                    .background(
                        canAddToCart
                            ? LinearGradient(colors: [.tuckerOrange, .red], startPoint: .leading, endPoint: .trailing)
                            : LinearGradient(colors: [.gray, .gray], startPoint: .leading, endPoint: .trailing)
                    )
                    .cornerRadius(22)
            }
            .disabled(!canAddToCart)
        }
        .padding(.horizontal)
        .padding(.vertical, 12)
        .background(Color.white)
        .shadow(color: .black.opacity(0.08), radius: 8, y: -4)
    }

    private func addToCart() {
        // Calculate option price add-on
        var optionPrice: Double = 0
        if let options = product.options {
            for option in options {
                if let selectedItem = selectedOptions[option.name],
                   let item = option.items.first(where: { $0.name == selectedItem }) {
                    optionPrice += item.price
                }
            }
        }

        onAddToCart(product, quantity, selectedOptions, optionPrice)
        dismiss()
    }
}

// MARK: - Option Item Row
struct OptionItemRow: View {
    let item: ProductOptionItem
    let isSelected: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            HStack {
                // Radio button
                ZStack {
                    Circle()
                        .stroke(isSelected ? Color.tuckerOrange : Color.gray.opacity(0.5), lineWidth: 2)
                        .frame(width: 22, height: 22)

                    if isSelected {
                        Circle()
                            .fill(Color.tuckerOrange)
                            .frame(width: 12, height: 12)
                    }
                }

                Text(item.name)
                    .font(.subheadline)
                    .foregroundColor(.primary)

                Spacer()

                if item.price > 0 {
                    Text("+$\(String(format: "%.2f", item.price))")
                        .font(.subheadline)
                        .foregroundColor(.tuckerOrange)
                }
            }
            .padding(.vertical, 8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    ProductOptionsSheet(
        product: Product(
            id: "1",
            name: "Chicken Burger",
            description: "Juicy chicken patty with fresh vegetables",
            image: nil,
            images: nil,
            price: 12.99,
            originalPrice: 15.99,
            monthlySales: 500,
            likes: 100,
            isAvailable: true,
            options: [
                ProductOption(name: "Size", required: true, items: [
                    ProductOptionItem(name: "Regular", price: 0),
                    ProductOptionItem(name: "Large", price: 2.00)
                ]),
                ProductOption(name: "Add-ons", required: false, items: [
                    ProductOptionItem(name: "Extra Cheese", price: 1.50),
                    ProductOptionItem(name: "Bacon", price: 2.00),
                    ProductOptionItem(name: "Avocado", price: 2.50)
                ])
            ],
            merchantId: "1",
            categoryId: "1",
            isRecommend: true
        ),
        merchantId: "1"
    ) { product, quantity, options, optionPrice in
        print("Added: \(product.name) x\(quantity)")
    }
    .environmentObject(CartManager())
}
