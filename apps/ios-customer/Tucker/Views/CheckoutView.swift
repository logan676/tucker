import SwiftUI

struct CheckoutView: View {
    @EnvironmentObject var cartManager: CartManager
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) var dismiss

    @State private var addresses: [Address] = []
    @State private var selectedAddressId: String?
    @State private var remark = ""
    @State private var isLoading = true
    @State private var isSubmitting = false
    @State private var error: String?
    @State private var showAddAddress = false
    @State private var createdOrderId: String?
    @State private var navigateToPayment = false
    @State private var selectedDeliveryTime = "Now"
    @State private var showCouponSheet = false
    @State private var selectedCoupon: Coupon?
    @State private var couponDiscount: Double = 0
    @State private var orderType: OrderType = .delivery

    enum OrderType: String, CaseIterable {
        case delivery = "Delivery"
        case pickup = "Pickup"
    }

    var deliveryFee: Double {
        orderType == .delivery ? 5.0 : 0.0
    }
    let packagingFee: Double = 2.0

    var totalAmount: Double {
        cartManager.totalPrice + deliveryFee + packagingFee - couponDiscount
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color(.systemGray6).ignoresSafeArea()

                if !authManager.isAuthenticated {
                    VStack(spacing: 20) {
                        Image(systemName: "person.crop.circle.badge.exclamationmark")
                            .font(.system(size: 72))
                            .foregroundColor(.tuckerOrange.opacity(0.6))
                        Text("Please login to checkout")
                            .font(.headline)
                            .foregroundColor(.gray)
                        NavigationLink(destination: LoginView()) {
                            Text("Login Now")
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                                .padding(.horizontal, 40)
                                .padding(.vertical, 14)
                                .background(
                                    LinearGradient(colors: [.tuckerOrange, .red], startPoint: .leading, endPoint: .trailing)
                                )
                                .cornerRadius(25)
                        }
                    }
                } else if isLoading {
                    ProgressView()
                        .scaleEffect(1.2)
                } else {
                    ScrollView {
                        VStack(spacing: 12) {
                            // Order Type Section (Delivery / Pickup)
                            orderTypeSection

                            // Delivery Address Section (only for delivery)
                            if orderType == .delivery {
                                addressSection
                            } else {
                                pickupInfoSection
                            }

                            // Delivery/Pickup Time Section
                            deliveryTimeSection

                            // Order Items Section
                            orderItemsSection

                            // Coupon Section
                            couponSection

                            // Remark Section
                            remarkSection

                            // Price Summary
                            priceSummarySection
                        }
                        .padding(.horizontal, 12)
                        .padding(.top, 8)
                        .padding(.bottom, 100)
                    }

                    // Bottom Bar
                    VStack {
                        Spacer()
                        bottomBar
                    }
                }
            }
            .navigationTitle("Confirm Order")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .foregroundColor(.primary)
                    }
                }
            }
            .task {
                await loadAddresses()
            }
            .alert("Error", isPresented: .constant(error != nil)) {
                Button("OK") { error = nil }
            } message: {
                Text(error ?? "")
            }
            .sheet(isPresented: $showAddAddress) {
                AddAddressView(onSave: { newAddress in
                    addresses.append(newAddress)
                    if selectedAddressId == nil {
                        selectedAddressId = newAddress.id
                    }
                })
            }
            .navigationDestination(isPresented: $navigateToPayment) {
                if let orderId = createdOrderId {
                    PaymentView(orderId: orderId)
                }
            }
        }
    }

    private var orderTypeSection: some View {
        HStack(spacing: 12) {
            ForEach(OrderType.allCases, id: \.self) { type in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        orderType = type
                    }
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: type == .delivery ? "bicycle" : "bag.fill")
                            .font(.subheadline)
                        Text(type.rawValue)
                            .font(.subheadline)
                            .fontWeight(.medium)
                    }
                    .foregroundColor(orderType == type ? .white : .primary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(
                        orderType == type
                            ? LinearGradient(colors: [.tuckerOrange, .red], startPoint: .leading, endPoint: .trailing)
                            : LinearGradient(colors: [Color(.systemGray5), Color(.systemGray5)], startPoint: .leading, endPoint: .trailing)
                    )
                    .cornerRadius(10)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
    }

    private var pickupInfoSection: some View {
        VStack(spacing: 0) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: "storefront.fill")
                    .font(.title3)
                    .foregroundColor(.tuckerOrange)
                    .frame(width: 24)

                VStack(alignment: .leading, spacing: 8) {
                    Text("Pickup from Restaurant")
                        .font(.subheadline)
                        .fontWeight(.semibold)

                    Text("Please pick up your order at the restaurant counter")
                        .font(.caption)
                        .foregroundColor(.gray)

                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                            .font(.caption2)
                        Text("Ready in 15-20 mins after confirmation")
                            .font(.caption)
                    }
                    .foregroundColor(.tuckerOrange)
                }

                Spacer()
            }
            .padding()

            // Decorative divider with triangles
            HStack(spacing: 0) {
                ForEach(0..<30, id: \.self) { index in
                    Triangle()
                        .fill(index % 2 == 0 ? Color.green : Color.tuckerOrange)
                        .frame(width: 14, height: 4)
                }
            }
        }
        .background(Color.white)
        .cornerRadius(12)
    }

    private var addressSection: some View {
        VStack(spacing: 0) {
            if addresses.isEmpty {
                Button {
                    showAddAddress = true
                } label: {
                    HStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(Color.tuckerOrange.opacity(0.15))
                                .frame(width: 44, height: 44)
                            Image(systemName: "plus")
                                .font(.title3)
                                .foregroundColor(.tuckerOrange)
                        }

                        VStack(alignment: .leading, spacing: 4) {
                            Text("Add Delivery Address")
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(.primary)
                            Text("Please add an address to continue")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    .padding()
                }
            } else if let address = addresses.first(where: { $0.id == selectedAddressId }) ?? addresses.first {
                Button {
                    // Show address picker
                } label: {
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: "location.fill")
                            .font(.title3)
                            .foregroundColor(.tuckerOrange)
                            .frame(width: 24)

                        VStack(alignment: .leading, spacing: 6) {
                            HStack(spacing: 8) {
                                Text(address.name)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.primary)
                                Text(address.phone)
                                    .foregroundColor(.gray)
                                if let label = address.label {
                                    Text(label)
                                        .font(.caption2)
                                        .foregroundColor(.tuckerOrange)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Color.tuckerOrange.opacity(0.1))
                                        .cornerRadius(4)
                                }
                            }
                            .font(.subheadline)

                            Text("\(address.district) \(address.detail)")
                                .font(.subheadline)
                                .foregroundColor(.gray)
                                .lineLimit(2)
                        }

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    .padding()
                }
            }

            // Decorative divider with triangles
            HStack(spacing: 0) {
                ForEach(0..<30, id: \.self) { index in
                    Triangle()
                        .fill(index % 2 == 0 ? Color.tuckerOrange : Color.blue)
                        .frame(width: 14, height: 4)
                }
            }
        }
        .background(Color.white)
        .cornerRadius(12)
    }

    private var deliveryTimeSection: some View {
        HStack {
            Image(systemName: "clock")
                .foregroundColor(.tuckerOrange)

            Text(orderType == .delivery ? "Delivery Time" : "Pickup Time")
                .font(.subheadline)

            Spacer()

            Menu {
                Button("Now (ASAP)") { selectedDeliveryTime = "Now" }
                Button("Schedule for later") { selectedDeliveryTime = "Scheduled" }
            } label: {
                HStack(spacing: 4) {
                    Text(selectedDeliveryTime == "Now" ? "As soon as possible" : "Scheduled")
                        .font(.subheadline)
                        .foregroundColor(.primary)
                    Image(systemName: "chevron.down")
                        .font(.caption2)
                        .foregroundColor(.gray)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
    }

    private var orderItemsSection: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Store header
            HStack(spacing: 8) {
                Image(systemName: "storefront.fill")
                    .foregroundColor(.tuckerOrange)
                Text("Merchant Name")
                    .font(.subheadline)
                    .fontWeight(.medium)
                Spacer()
            }
            .padding()
            .background(Color(.systemGray6).opacity(0.5))

            // Items
            ForEach(cartManager.items) { item in
                HStack(spacing: 12) {
                    AsyncImage(url: URL(string: item.product.image ?? "")) { image in
                        image.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Rectangle().fill(Color.gray.opacity(0.2))
                    }
                    .frame(width: 60, height: 60)
                    .cornerRadius(8)

                    VStack(alignment: .leading, spacing: 6) {
                        Text(item.product.name)
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .lineLimit(2)

                        HStack(alignment: .firstTextBaseline, spacing: 2) {
                            Text("$")
                                .font(.caption)
                            Text("\(Int(item.product.price))")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                        }
                        .foregroundColor(.red)
                    }

                    Spacer()

                    Text("x\(item.quantity)")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color(.systemGray6))
                        .cornerRadius(4)
                }
                .padding()

                if item.id != cartManager.items.last?.id {
                    Divider()
                        .padding(.leading, 84)
                }
            }

            // Add more items
            Divider()
            Button {
                dismiss()
            } label: {
                HStack {
                    Image(systemName: "plus.circle")
                        .foregroundColor(.tuckerOrange)
                    Text("Add more items")
                        .font(.subheadline)
                        .foregroundColor(.tuckerOrange)
                    Spacer()
                }
                .padding()
            }
        }
        .background(Color.white)
        .cornerRadius(12)
    }

    private var couponSection: some View {
        Button {
            showCouponSheet = true
        } label: {
            HStack {
                Image(systemName: "ticket.fill")
                    .foregroundColor(.red)

                Text("Coupons")
                    .font(.subheadline)
                    .foregroundColor(.primary)

                Spacer()

                if let coupon = selectedCoupon {
                    HStack(spacing: 4) {
                        Text(coupon.name)
                            .font(.caption)
                            .foregroundColor(.tuckerOrange)
                        Text("-$\(String(format: "%.0f", couponDiscount))")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.red)
                    }
                } else {
                    Text("Select coupon")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            .padding()
            .background(Color.white)
            .cornerRadius(12)
        }
        .sheet(isPresented: $showCouponSheet) {
            CouponSheet(
                merchantId: cartManager.merchantId,
                orderAmount: cartManager.totalPrice
            ) { coupon, discount in
                selectedCoupon = coupon
                couponDiscount = discount
            }
        }
    }

    private var remarkSection: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Image(systemName: "pencil")
                    .foregroundColor(.gray)
                TextField("Add notes for the merchant...", text: $remark)
                    .font(.subheadline)
            }
            .padding()

            Divider()

            // Tableware option
            HStack {
                Image(systemName: "fork.knife")
                    .foregroundColor(.gray)
                Text("Tableware")
                    .font(.subheadline)
                Spacer()
                Text("As needed")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            .padding()
        }
        .background(Color.white)
        .cornerRadius(12)
    }

    private var priceSummarySection: some View {
        VStack(spacing: 12) {
            // Price breakdown
            VStack(spacing: 10) {
                PriceRow(title: "Subtotal", value: cartManager.totalPrice)

                if orderType == .delivery {
                    PriceRow(title: "Delivery Fee", value: deliveryFee, originalValue: 8.0)
                } else {
                    HStack {
                        Text("Delivery Fee")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                        Spacer()
                        Text("FREE")
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(.green)
                    }
                }

                PriceRow(title: "Packaging Fee", value: packagingFee)

                if couponDiscount > 0 {
                    HStack {
                        HStack(spacing: 4) {
                            Image(systemName: "ticket.fill")
                                .font(.caption2)
                            Text("Coupon Discount")
                        }
                        .font(.subheadline)
                        .foregroundColor(.green)
                        Spacer()
                        Text("-$\(String(format: "%.2f", couponDiscount))")
                            .font(.subheadline)
                            .foregroundColor(.green)
                    }
                }
            }

            Divider()

            // Savings
            let totalSavings = couponDiscount + (orderType == .pickup ? 8.0 : 3.0)
            if totalSavings > 0 {
                HStack {
                    Image(systemName: "tag.fill")
                        .foregroundColor(.red)
                        .font(.caption)
                    Text("You saved $\(String(format: "%.2f", totalSavings)) on this order")
                        .font(.caption)
                        .foregroundColor(.red)
                    Spacer()
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
    }

    private var canSubmitOrder: Bool {
        if orderType == .pickup {
            return true
        }
        return selectedAddressId != nil
    }

    private var bottomBar: some View {
        HStack(spacing: 16) {
            // Price section
            VStack(alignment: .leading, spacing: 2) {
                HStack(alignment: .firstTextBaseline, spacing: 2) {
                    Text("$")
                        .font(.subheadline)
                    Text(String(format: "%.0f", totalAmount))
                        .font(.title2)
                        .fontWeight(.bold)
                }
                .foregroundColor(.primary)

                let totalSavings = couponDiscount + (orderType == .pickup ? 8.0 : 3.0)
                Text("Saved $\(String(format: "%.0f", totalSavings))")
                    .font(.caption2)
                    .foregroundColor(.tuckerOrange)
            }

            Spacer()

            // Submit button
            Button {
                Task { await submitOrder() }
            } label: {
                if isSubmitting {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .frame(width: 140)
                } else {
                    Text("Submit Order")
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .frame(width: 140)
                }
            }
            .foregroundColor(.white)
            .padding(.vertical, 14)
            .background(
                canSubmitOrder
                    ? LinearGradient(colors: [.tuckerOrange, .red], startPoint: .leading, endPoint: .trailing)
                    : LinearGradient(colors: [.gray, .gray], startPoint: .leading, endPoint: .trailing)
            )
            .cornerRadius(22)
            .disabled(!canSubmitOrder || isSubmitting)
        }
        .padding(.horizontal)
        .padding(.vertical, 12)
        .background(Color.white)
        .shadow(color: .black.opacity(0.08), radius: 8, y: -4)
    }

    private func loadAddresses() async {
        isLoading = true
        do {
            addresses = try await APIService.shared.getAddresses()
            selectedAddressId = addresses.first(where: { $0.isDefault })?.id ?? addresses.first?.id
        } catch {
            self.error = "Failed to load addresses"
        }
        isLoading = false
    }

    private func submitOrder() async {
        guard let merchantId = cartManager.merchantId else {
            error = "Invalid cart"
            return
        }

        // For delivery, require an address
        if orderType == .delivery && selectedAddressId == nil {
            error = "Please select a delivery address"
            return
        }

        isSubmitting = true
        do {
            let orderResponse = try await APIService.shared.createOrder(
                merchantId: merchantId,
                addressId: orderType == .delivery ? selectedAddressId : nil,
                items: cartManager.items.map { OrderItemRequest(productId: $0.product.id, quantity: $0.quantity) },
                remark: remark.isEmpty ? nil : (orderType == .pickup ? "[PICKUP] \(remark)" : remark),
                orderType: orderType == .pickup ? "pickup" : "delivery"
            )
            createdOrderId = orderResponse.orderId
            cartManager.clearCart()
            navigateToPayment = true
        } catch {
            self.error = "Failed to create order: \(error.localizedDescription)"
        }
        isSubmitting = false
    }
}

// MARK: - Supporting Views

struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.midX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
        path.closeSubpath()
        return path
    }
}

struct PriceRow: View {
    let title: String
    let value: Double
    var originalValue: Double? = nil

    var body: some View {
        HStack {
            Text(title)
                .font(.subheadline)
                .foregroundColor(.gray)

            Spacer()

            if let original = originalValue, original > value {
                Text("$\(String(format: "%.0f", original))")
                    .font(.caption)
                    .foregroundColor(.gray)
                    .strikethrough()
            }

            Text("$\(String(format: "%.2f", value))")
                .font(.subheadline)
        }
    }
}

struct AddressRow: View {
    let address: Address
    let isSelected: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(isSelected ? .tuckerOrange : .gray)

                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(address.name)
                            .fontWeight(.medium)
                        Text(address.phone)
                            .foregroundColor(.gray)
                        if let label = address.label {
                            Text(label)
                                .font(.caption)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color(.systemGray5))
                                .cornerRadius(4)
                        }
                    }
                    Text("\(address.province) \(address.city) \(address.district) \(address.detail)")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }

                Spacer()
            }
            .padding()
            .background(isSelected ? Color.tuckerOrange.opacity(0.1) : Color(.systemGray6))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.tuckerOrange : Color.clear, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    CheckoutView()
        .environmentObject(CartManager())
        .environmentObject(AuthManager())
}
