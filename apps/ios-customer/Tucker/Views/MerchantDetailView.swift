import SwiftUI

struct MerchantDetailView: View {
    let merchantId: String
    @EnvironmentObject var cartManager: CartManager

    @State private var merchant: Merchant?
    @State private var menu: MenuResponse?
    @State private var selectedCategory: String?
    @State private var isLoading = true

    var body: some View {
        ZStack(alignment: .bottom) {
            ScrollView {
                VStack(spacing: 0) {
                    // Banner
                    AsyncImage(url: URL(string: merchant?.banner ?? "")) { image in
                        image.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Rectangle().fill(Color.gray.opacity(0.2))
                    }
                    .frame(height: 180)
                    .clipped()

                    // Merchant Info
                    if let merchant = merchant {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack(spacing: 12) {
                                AsyncImage(url: URL(string: merchant.logo ?? "")) { image in
                                    image.resizable().aspectRatio(contentMode: .fill)
                                } placeholder: {
                                    Rectangle().fill(Color.gray.opacity(0.2))
                                }
                                .frame(width: 60, height: 60)
                                .cornerRadius(8)
                                .offset(y: -20)

                                VStack(alignment: .leading, spacing: 4) {
                                    Text(merchant.name)
                                        .font(.title2)
                                        .fontWeight(.bold)

                                    HStack {
                                        Image(systemName: "star.fill")
                                            .foregroundColor(.orange)
                                        Text(String(format: "%.1f", merchant.rating))
                                            .foregroundColor(.orange)
                                        Text("(\(merchant.ratingCount) reviews)")
                                            .foregroundColor(.gray)
                                    }
                                    .font(.caption)
                                }

                                Spacer()
                            }

                            Text(merchant.description ?? "")
                                .font(.subheadline)
                                .foregroundColor(.gray)

                            HStack(spacing: 16) {
                                Label(merchant.deliveryTime ?? "30-45 min", systemImage: "clock")
                                Label("¥\(Int(merchant.deliveryFee))", systemImage: "bicycle")
                                Label("Min ¥\(Int(merchant.minOrderAmount))", systemImage: "bag")
                            }
                            .font(.caption)
                            .foregroundColor(.gray)
                        }
                        .padding()
                        .background(Color.white)
                    }

                    Divider()

                    // Menu
                    if let menu = menu {
                        HStack(alignment: .top, spacing: 0) {
                            // Category sidebar
                            VStack(spacing: 0) {
                                ForEach(menu.categories) { category in
                                    Button {
                                        selectedCategory = category.id
                                    } label: {
                                        Text(category.name)
                                            .font(.subheadline)
                                            .padding(.vertical, 12)
                                            .padding(.horizontal, 8)
                                            .frame(maxWidth: .infinity, alignment: .leading)
                                            .background(selectedCategory == category.id ? Color.white : Color(.systemGray6))
                                            .foregroundColor(selectedCategory == category.id ? .orange : .primary)
                                    }
                                }
                            }
                            .frame(width: 90)
                            .background(Color(.systemGray6))

                            // Products
                            ScrollView {
                                LazyVStack(spacing: 0) {
                                    if let category = menu.categories.first(where: { $0.id == selectedCategory }) {
                                        ForEach(category.products) { product in
                                            ProductRow(product: product)
                                            Divider().padding(.leading, 96)
                                        }
                                    }
                                }
                            }
                        }
                        .frame(minHeight: 400)
                    }
                }
            }
            .padding(.bottom, cartManager.totalItems > 0 ? 60 : 0)

            // Cart Bar
            if cartManager.totalItems > 0 {
                CartBar()
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadData()
        }
    }

    private func loadData() async {
        isLoading = true
        do {
            async let merchantResult = APIService.shared.getMerchant(id: merchantId)
            async let menuResult = APIService.shared.getMerchantMenu(merchantId: merchantId)

            let (merch, menuData) = try await (merchantResult, menuResult)
            merchant = merch
            menu = menuData
            selectedCategory = menuData.categories.first?.id
        } catch {
            print("Error loading merchant: \(error)")
        }
        isLoading = false
    }
}

struct ProductRow: View {
    let product: Product
    @EnvironmentObject var cartManager: CartManager

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: product.image ?? "")) { image in
                image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle().fill(Color.gray.opacity(0.2))
            }
            .frame(width: 80, height: 80)
            .cornerRadius(8)
            .overlay(alignment: .topLeading) {
                if product.isRecommend {
                    Text("HOT")
                        .font(.system(size: 10))
                        .foregroundColor(.white)
                        .padding(.horizontal, 4)
                        .padding(.vertical, 2)
                        .background(Color.red)
                        .cornerRadius(4, corners: [.topLeft, .bottomRight])
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(product.name)
                    .font(.subheadline)
                    .fontWeight(.medium)

                Text(product.description ?? "")
                    .font(.caption)
                    .foregroundColor(.gray)
                    .lineLimit(2)

                HStack {
                    Text("¥\(Int(product.price))")
                        .foregroundColor(.orange)
                        .fontWeight(.medium)

                    if let originalPrice = product.originalPrice {
                        Text("¥\(Int(originalPrice))")
                            .font(.caption)
                            .foregroundColor(.gray)
                            .strikethrough()
                    }

                    Spacer()

                    HStack(spacing: 8) {
                        if cartManager.getQuantity(for: product.id) > 0 {
                            Button {
                                cartManager.removeItem(product)
                            } label: {
                                Image(systemName: "minus")
                                    .font(.caption)
                                    .foregroundColor(.orange)
                                    .frame(width: 24, height: 24)
                                    .overlay(Circle().stroke(Color.orange, lineWidth: 1))
                            }

                            Text("\(cartManager.getQuantity(for: product.id))")
                                .font(.subheadline)
                        }

                        Button {
                            cartManager.addItem(product)
                        } label: {
                            Image(systemName: "plus")
                                .font(.caption)
                                .foregroundColor(.white)
                                .frame(width: 24, height: 24)
                                .background(Color.orange)
                                .clipShape(Circle())
                        }
                    }
                }
            }
        }
        .padding()
    }
}

struct CartBar: View {
    @EnvironmentObject var cartManager: CartManager

    var body: some View {
        HStack {
            ZStack(alignment: .topTrailing) {
                Image(systemName: "cart.fill")
                    .font(.title2)
                    .foregroundColor(.white)

                Text("\(cartManager.totalItems)")
                    .font(.caption2)
                    .foregroundColor(.white)
                    .padding(4)
                    .background(Color.red)
                    .clipShape(Circle())
                    .offset(x: 8, y: -8)
            }

            Text("¥\(String(format: "%.2f", cartManager.totalPrice))")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.white)

            Spacer()

            Button("Checkout") {
                // Navigate to checkout
            }
            .fontWeight(.medium)
            .foregroundColor(.white)
            .padding(.horizontal, 24)
            .padding(.vertical, 8)
            .background(Color.orange)
            .cornerRadius(20)
        }
        .padding()
        .background(Color(.darkGray))
    }
}

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

#Preview {
    MerchantDetailView(merchantId: "1")
        .environmentObject(CartManager())
}
