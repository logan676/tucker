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

    var body: some View {
        NavigationStack {
            ZStack {
                if !authManager.isAuthenticated {
                    VStack(spacing: 16) {
                        Image(systemName: "person.crop.circle.badge.exclamationmark")
                            .font(.system(size: 64))
                            .foregroundColor(.gray)
                        Text("Please login to checkout")
                            .foregroundColor(.gray)
                        NavigationLink(destination: LoginView()) {
                            Text("Login")
                                .fontWeight(.medium)
                                .foregroundColor(.white)
                                .padding(.horizontal, 32)
                                .padding(.vertical, 12)
                                .background(Color.orange)
                                .cornerRadius(20)
                        }
                    }
                } else if isLoading {
                    ProgressView()
                } else {
                    ScrollView {
                        VStack(spacing: 16) {
                            // Delivery Address Section
                            addressSection

                            // Order Items Section
                            orderItemsSection

                            // Remark Section
                            remarkSection

                            // Price Summary
                            priceSummarySection
                        }
                        .padding()
                        .padding(.bottom, 80)
                    }

                    // Bottom Bar
                    VStack {
                        Spacer()
                        bottomBar
                    }
                }
            }
            .navigationTitle("Checkout")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
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

    private var addressSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "location.fill")
                    .foregroundColor(.orange)
                Text("Delivery Address")
                    .font(.headline)
            }

            if addresses.isEmpty {
                Button {
                    showAddAddress = true
                } label: {
                    HStack {
                        Image(systemName: "plus.circle")
                        Text("Add delivery address")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    .foregroundColor(.orange)
                }
            } else {
                ForEach(addresses) { address in
                    AddressRow(
                        address: address,
                        isSelected: selectedAddressId == address.id,
                        onSelect: { selectedAddressId = address.id }
                    )
                }

                Button {
                    showAddAddress = true
                } label: {
                    Text("+ Add new address")
                        .foregroundColor(.orange)
                        .font(.subheadline)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
    }

    private var orderItemsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "bag.fill")
                    .foregroundColor(.orange)
                Text("Order Items")
                    .font(.headline)
            }

            ForEach(cartManager.items) { item in
                HStack(spacing: 12) {
                    AsyncImage(url: URL(string: item.product.image ?? "")) { image in
                        image.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Rectangle().fill(Color.gray.opacity(0.2))
                    }
                    .frame(width: 50, height: 50)
                    .cornerRadius(8)

                    VStack(alignment: .leading, spacing: 4) {
                        Text(item.product.name)
                            .font(.subheadline)
                        Text("¥\(Int(item.product.price))")
                            .foregroundColor(.orange)
                            .font(.caption)
                    }

                    Spacer()

                    Text("x\(item.quantity)")
                        .foregroundColor(.gray)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
    }

    private var remarkSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Order Notes")
                .font(.headline)

            TextField("Add any special instructions...", text: $remark, axis: .vertical)
                .lineLimit(2...4)
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(8)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
    }

    private var priceSummarySection: some View {
        VStack(spacing: 8) {
            HStack {
                Text("Subtotal")
                    .foregroundColor(.gray)
                Spacer()
                Text("¥\(String(format: "%.2f", cartManager.totalPrice))")
            }
            HStack {
                Text("Delivery Fee")
                    .foregroundColor(.gray)
                Spacer()
                Text("¥5.00") // TODO: Get from merchant
            }
            Divider()
            HStack {
                Text("Total")
                    .fontWeight(.bold)
                Spacer()
                Text("¥\(String(format: "%.2f", cartManager.totalPrice + 5))")
                    .fontWeight(.bold)
                    .foregroundColor(.orange)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
    }

    private var bottomBar: some View {
        HStack {
            VStack(alignment: .leading) {
                Text("Total")
                    .font(.caption)
                    .foregroundColor(.gray)
                Text("¥\(String(format: "%.2f", cartManager.totalPrice + 5))")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.orange)
            }

            Spacer()

            Button {
                Task { await submitOrder() }
            } label: {
                if isSubmitting {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else {
                    Text("Place Order")
                        .fontWeight(.medium)
                }
            }
            .foregroundColor(.white)
            .padding(.horizontal, 32)
            .padding(.vertical, 14)
            .background(selectedAddressId != nil ? Color.orange : Color.gray)
            .cornerRadius(25)
            .disabled(selectedAddressId == nil || isSubmitting)
        }
        .padding()
        .background(Color.white)
        .shadow(color: .black.opacity(0.1), radius: 5, y: -2)
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
        guard let addressId = selectedAddressId,
              let merchantId = cartManager.merchantId else {
            error = "Please select a delivery address"
            return
        }

        isSubmitting = true
        do {
            let orderResponse = try await APIService.shared.createOrder(
                merchantId: merchantId,
                addressId: addressId,
                items: cartManager.items.map { OrderItemRequest(productId: $0.product.id, quantity: $0.quantity) },
                remark: remark.isEmpty ? nil : remark
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

struct AddressRow: View {
    let address: Address
    let isSelected: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(isSelected ? .orange : .gray)

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
            .background(isSelected ? Color.orange.opacity(0.1) : Color(.systemGray6))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.orange : Color.clear, lineWidth: 1)
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
