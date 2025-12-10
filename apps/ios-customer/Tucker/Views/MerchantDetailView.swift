import SwiftUI

struct MerchantDetailView: View {
    let merchantId: String
    @EnvironmentObject var cartManager: CartManager

    @State private var merchant: Merchant?
    @State private var menu: MenuResponse?
    @State private var selectedCategory: String?
    @State private var isLoading = true
    @State private var showDeliveryOptions = false

    var body: some View {
        ZStack(alignment: .bottom) {
            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                ScrollView {
                    VStack(spacing: 0) {
                        // Banner with overlay info
                        bannerSection

                        // Merchant Info Card
                        merchantInfoSection

                        // Deals Section
                        dealsSection

                        // Delivery/Pickup Toggle
                        deliveryToggle

                        // Menu Section
                        menuSection
                    }
                }
                .padding(.bottom, cartManager.totalItems > 0 ? 70 : 0)
            }

            // Cart Bar
            if cartManager.totalItems > 0 {
                CartBar(merchantId: merchantId, merchantName: merchant?.name ?? "")
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .background(Color(.systemGray6))
        .task {
            await loadData()
        }
    }

    // MARK: - Banner Section
    private var bannerSection: some View {
        let bannerUrl = merchant?.banner ?? merchant?.logo?.replacingOccurrences(of: "w=200", with: "w=800&h=300&fit=crop")
        return ZStack(alignment: .bottomLeading) {
            AsyncImage(url: URL(string: bannerUrl ?? "")) { image in
                image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
                LinearGradient(
                    colors: [.red.opacity(0.8), .tuckerOrange.opacity(0.8)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            }
            .frame(height: 180)
            .clipped()

            // Overlay gradient
            LinearGradient(
                colors: [.clear, .black.opacity(0.5)],
                startPoint: .top,
                endPoint: .bottom
            )
            .frame(height: 180)

            // Badge overlays
            HStack {
                Text("Fresh Daily")
                    .font(.caption2)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(.ultraThinMaterial)
                    .cornerRadius(12)

                Text("Made to Order")
                    .font(.caption2)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(.ultraThinMaterial)
                    .cornerRadius(12)
            }
            .padding()
        }
    }

    // MARK: - Merchant Info Section
    private var merchantInfoSection: some View {
        VStack(spacing: 0) {
            if let merchant = merchant {
                HStack(spacing: 12) {
                    // Logo
                    AsyncImage(url: URL(string: merchant.logo ?? "")) { image in
                        image.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Rectangle().fill(Color.gray.opacity(0.2))
                    }
                    .frame(width: 60, height: 60)
                    .cornerRadius(8)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color.white, lineWidth: 2)
                    )
                    .shadow(radius: 2)

                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(merchant.name)
                                .font(.headline)
                                .fontWeight(.bold)

                            if !merchant.isOpen {
                                Text("Closed")
                                    .font(.caption2)
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(Color.gray)
                                    .cornerRadius(4)
                            }
                        }

                        HStack(spacing: 12) {
                            // Rating
                            HStack(spacing: 2) {
                                Text("Rating")
                                    .foregroundColor(.gray)
                                Text(String(format: "%.1f", merchant.rating))
                                    .foregroundColor(.tuckerOrange)
                                    .fontWeight(.bold)
                            }

                            // Monthly Sales
                            HStack(spacing: 2) {
                                Text("Sales")
                                    .foregroundColor(.gray)
                                Text("\(merchant.monthlySales)+")
                                    .foregroundColor(.primary)
                            }

                            // Delivery Time
                            HStack(spacing: 2) {
                                Image(systemName: "clock")
                                    .foregroundColor(.blue)
                                Text(merchant.deliveryTime ?? "30 min")
                                    .foregroundColor(.primary)
                            }
                        }
                        .font(.caption)
                    }

                    Spacer()

                    Image(systemName: "chevron.right")
                        .foregroundColor(.gray)
                        .font(.caption)
                }
                .padding()
            }
        }
        .background(Color.white)
    }

    // MARK: - Deals Section
    private var dealsSection: some View {
        VStack(spacing: 8) {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    DealBadge(icon: "bolt.fill", text: "¥13 off ¥57", color: .red)
                    DealBadge(icon: "star.fill", text: "¥3 review bonus", color: .tuckerOrange)
                    DealBadge(icon: "ticket.fill", text: "¥2 coupon", color: .green)
                    DealBadge(icon: "gift.fill", text: "Free delivery", color: .blue)
                }
                .padding(.horizontal)
            }
        }
        .padding(.vertical, 8)
        .background(Color.white)
    }

    // MARK: - Delivery Toggle
    private var deliveryToggle: some View {
        HStack(spacing: 0) {
            Button {
                showDeliveryOptions = false
            } label: {
                VStack(spacing: 4) {
                    Text("Delivery")
                        .font(.subheadline)
                        .fontWeight(showDeliveryOptions ? .regular : .bold)
                        .foregroundColor(showDeliveryOptions ? .gray : .primary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(showDeliveryOptions ? Color.clear : Color.white)
            }

            Button {
                showDeliveryOptions = true
            } label: {
                HStack(spacing: 4) {
                    Text("Pickup")
                        .font(.subheadline)
                        .fontWeight(showDeliveryOptions ? .bold : .regular)
                        .foregroundColor(showDeliveryOptions ? .primary : .gray)

                    Text("New -¥4")
                        .font(.caption2)
                        .foregroundColor(.white)
                        .padding(.horizontal, 4)
                        .padding(.vertical, 2)
                        .background(Color.red)
                        .cornerRadius(4)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(showDeliveryOptions ? Color.white : Color.clear)
            }
        }
        .background(Color(.systemGray6))
        .padding(.top, 8)
    }

    // MARK: - Menu Section
    private var menuSection: some View {
        VStack(spacing: 0) {
            if let menu = menu, !menu.categories.isEmpty {
                HStack(alignment: .top, spacing: 0) {
                    // Category sidebar
                    ScrollView {
                        VStack(spacing: 0) {
                            ForEach(menu.categories) { category in
                                Button {
                                    withAnimation {
                                        selectedCategory = category.id
                                    }
                                } label: {
                                    HStack {
                                        if selectedCategory == category.id {
                                            Rectangle()
                                                .fill(Color.tuckerOrange)
                                                .frame(width: 3)
                                        }

                                        Text(category.name)
                                            .font(.subheadline)
                                            .foregroundColor(selectedCategory == category.id ? .tuckerOrange : .primary)
                                            .lineLimit(2)
                                            .multilineTextAlignment(.leading)

                                        Spacer()
                                    }
                                    .padding(.vertical, 14)
                                    .padding(.horizontal, 8)
                                    .background(selectedCategory == category.id ? Color.white : Color(.systemGray6))
                                }
                            }
                        }
                    }
                    .frame(width: 85)
                    .background(Color(.systemGray6))

                    // Products list
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            if let category = menu.categories.first(where: { $0.id == selectedCategory }) {
                                ForEach(category.products) { product in
                                    ProductRow(product: product, merchantId: merchantId)
                                    Divider()
                                        .padding(.leading, 96)
                                }
                            }
                        }
                        .background(Color.white)
                    }
                }
                .frame(minHeight: 500)
            } else {
                VStack(spacing: 16) {
                    Image(systemName: "fork.knife")
                        .font(.system(size: 48))
                        .foregroundColor(.gray)
                    Text("No menu available")
                        .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 60)
                .background(Color.white)
            }
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

// MARK: - Deal Badge
struct DealBadge: View {
    let icon: String
    let text: String
    let color: Color

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption2)
            Text(text)
                .font(.caption)
        }
        .foregroundColor(color)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(color.opacity(0.1))
        .cornerRadius(4)
    }
}

// MARK: - Product Row
struct ProductRow: View {
    let product: Product
    let merchantId: String
    @EnvironmentObject var cartManager: CartManager

    var body: some View {
        HStack(spacing: 12) {
            // Product Image
            ZStack(alignment: .topLeading) {
                AsyncImage(url: URL(string: product.image ?? "")) { image in
                    image.resizable().aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle().fill(Color.gray.opacity(0.2))
                }
                .frame(width: 90, height: 90)
                .cornerRadius(8)

                if product.isRecommend == true {
                    Text("HOT")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(
                            LinearGradient(colors: [.red, .tuckerOrange], startPoint: .leading, endPoint: .trailing)
                        )
                        .cornerRadius(4, corners: [.topLeft, .bottomRight])
                }
            }

            VStack(alignment: .leading, spacing: 6) {
                Text(product.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .lineLimit(1)

                if let description = product.description, !description.isEmpty {
                    Text(description)
                        .font(.caption)
                        .foregroundColor(.gray)
                        .lineLimit(2)
                }

                Text("\(product.monthlySales) sold")
                    .font(.caption2)
                    .foregroundColor(.gray)

                HStack {
                    // Price
                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text("¥")
                            .font(.caption)
                            .foregroundColor(.red)
                        Text("\(Int(product.price))")
                            .font(.headline)
                            .foregroundColor(.red)

                        if let originalPrice = product.originalPrice, originalPrice > product.price {
                            Text("¥\(Int(originalPrice))")
                                .font(.caption)
                                .foregroundColor(.gray)
                                .strikethrough()
                        }
                    }

                    Spacer()

                    // Add to cart controls
                    HStack(spacing: 12) {
                        let quantity = cartManager.getQuantity(for: product.id)

                        if quantity > 0 {
                            Button {
                                withAnimation(.spring(response: 0.3)) {
                                    cartManager.removeItem(product)
                                }
                            } label: {
                                Image(systemName: "minus")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(.tuckerOrange)
                                    .frame(width: 24, height: 24)
                                    .overlay(
                                        Circle()
                                            .stroke(Color.tuckerOrange, lineWidth: 1.5)
                                    )
                            }

                            Text("\(quantity)")
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .frame(minWidth: 20)
                        }

                        Button {
                            withAnimation(.spring(response: 0.3)) {
                                cartManager.addItem(product, merchantId: merchantId)
                            }
                        } label: {
                            Image(systemName: "plus")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white)
                                .frame(width: 24, height: 24)
                                .background(Color.tuckerOrange)
                                .clipShape(Circle())
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
    }
}

// MARK: - Cart Bar
struct CartBar: View {
    let merchantId: String
    let merchantName: String
    @EnvironmentObject var cartManager: CartManager
    @State private var showCheckout = false

    var body: some View {
        HStack(spacing: 12) {
            // Cart icon with badge
            ZStack {
                Circle()
                    .fill(Color.tuckerOrange)
                    .frame(width: 50, height: 50)

                Image(systemName: "cart.fill")
                    .font(.title3)
                    .foregroundColor(.white)

                // Badge
                Text("\(cartManager.totalItems)")
                    .font(.caption2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .padding(5)
                    .background(Color.red)
                    .clipShape(Circle())
                    .offset(x: 15, y: -15)
            }

            VStack(alignment: .leading, spacing: 2) {
                HStack(alignment: .firstTextBaseline, spacing: 2) {
                    Text("¥")
                        .font(.caption)
                    Text(String(format: "%.0f", cartManager.totalPrice))
                        .font(.title2)
                        .fontWeight(.bold)
                }
                .foregroundColor(.white)

                Text("Delivery fee ¥5")
                    .font(.caption2)
                    .foregroundColor(.gray)
            }

            Spacer()

            Button {
                showCheckout = true
            } label: {
                Text("Checkout")
                    .font(.subheadline)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(
                        LinearGradient(colors: [.tuckerOrange, .red], startPoint: .leading, endPoint: .trailing)
                    )
                    .cornerRadius(20)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(Color(red: 0.2, green: 0.2, blue: 0.2))
        .sheet(isPresented: $showCheckout) {
            CheckoutView()
        }
    }
}

// MARK: - Helper Extensions
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
    NavigationStack {
        MerchantDetailView(merchantId: "1")
            .environmentObject(CartManager())
    }
}
