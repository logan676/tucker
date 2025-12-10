import SwiftUI

struct OrderDetailView: View {
    let orderId: String

    @State private var order: Order?
    @State private var isLoading = true
    @State private var error: String?
    @Environment(\.dismiss) var dismiss

    var body: some View {
        ZStack {
            Color(.systemGray6).ignoresSafeArea()

            if isLoading {
                ProgressView()
                    .scaleEffect(1.2)
            } else if let order = order {
                ScrollView {
                    VStack(spacing: 12) {
                        // Status Header
                        statusHeader(order: order)

                        // Delivery Address
                        if let address = order.deliveryAddress {
                            addressSection(address: address)
                        }

                        // Order Items
                        itemsSection(order: order)

                        // Price Summary
                        priceSummarySection(order: order)

                        // Order Info
                        orderInfoSection(order: order)
                    }
                    .padding(.horizontal, 12)
                    .padding(.top, 8)
                    .padding(.bottom, 100)
                }

                // Bottom Actions
                VStack {
                    Spacer()
                    bottomActions(order: order)
                }
            } else if let error = error {
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.system(size: 48))
                        .foregroundColor(.gray)
                    Text(error)
                        .foregroundColor(.gray)
                    Button("Try Again") {
                        Task { await loadOrder() }
                    }
                    .foregroundColor(.tuckerOrange)
                }
            }
        }
        .navigationTitle("Order Details")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadOrder()
        }
    }

    // MARK: - Status Header
    private func statusHeader(order: Order) -> some View {
        VStack(spacing: 16) {
            // Status Icon
            ZStack {
                Circle()
                    .fill(statusColor(order.status).opacity(0.15))
                    .frame(width: 80, height: 80)

                Image(systemName: statusIcon(order.status))
                    .font(.system(size: 36))
                    .foregroundColor(statusColor(order.status))
            }

            // Status Text
            Text(statusText(order.status))
                .font(.title2)
                .fontWeight(.bold)

            Text(statusDescription(order.status))
                .font(.subheadline)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
        .background(Color.white)
        .cornerRadius(12)
    }

    // MARK: - Address Section
    private func addressSection(address: DeliveryAddress) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "location.fill")
                .font(.title3)
                .foregroundColor(.tuckerOrange)
                .frame(width: 24)

            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 8) {
                    Text(address.name)
                        .fontWeight(.semibold)
                    Text(address.phone)
                        .foregroundColor(.gray)
                }
                .font(.subheadline)

                Text("\(address.district) \(address.detail)")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .lineLimit(2)
            }

            Spacer()
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
    }

    // MARK: - Items Section
    private func itemsSection(order: Order) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack(spacing: 8) {
                Image(systemName: "storefront.fill")
                    .foregroundColor(.tuckerOrange)
                Text(order.merchantName ?? "Restaurant")
                    .font(.subheadline)
                    .fontWeight(.medium)
                Spacer()
                NavigationLink(destination: MerchantDetailView(merchantId: order.merchantId)) {
                    HStack(spacing: 2) {
                        Text("Order Again")
                            .font(.caption)
                        Image(systemName: "chevron.right")
                            .font(.caption2)
                    }
                    .foregroundColor(.tuckerOrange)
                }
            }
            .padding()
            .background(Color(.systemGray6).opacity(0.5))

            // Items
            if let items = order.items {
                ForEach(items) { item in
                    HStack(spacing: 12) {
                        AsyncImage(url: URL(string: item.image ?? "")) { image in
                            image.resizable().aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Rectangle().fill(Color.gray.opacity(0.2))
                        }
                        .frame(width: 60, height: 60)
                        .cornerRadius(8)

                        VStack(alignment: .leading, spacing: 6) {
                            Text(item.productName)
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .lineLimit(2)

                            HStack(alignment: .firstTextBaseline, spacing: 2) {
                                Text("$")
                                    .font(.caption)
                                Text(String(format: "%.2f", item.price))
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

                    if item.id != items.last?.id {
                        Divider()
                            .padding(.leading, 84)
                    }
                }
            }
        }
        .background(Color.white)
        .cornerRadius(12)
    }

    // MARK: - Price Summary Section
    private func priceSummarySection(order: Order) -> some View {
        VStack(spacing: 12) {
            HStack {
                Text("Subtotal")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                Spacer()
                Text("$\(String(format: "%.2f", order.totalAmount - order.deliveryFee + order.discountAmount))")
                    .font(.subheadline)
            }

            HStack {
                Text("Delivery Fee")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                Spacer()
                Text("$\(String(format: "%.2f", order.deliveryFee))")
                    .font(.subheadline)
            }

            if order.discountAmount > 0 {
                HStack {
                    Text("Discount")
                        .font(.subheadline)
                        .foregroundColor(.green)
                    Spacer()
                    Text("-$\(String(format: "%.2f", order.discountAmount))")
                        .font(.subheadline)
                        .foregroundColor(.green)
                }
            }

            Divider()

            HStack {
                Text("Total Paid")
                    .font(.headline)
                Spacer()
                HStack(alignment: .firstTextBaseline, spacing: 2) {
                    Text("$")
                        .font(.subheadline)
                    Text(String(format: "%.2f", order.payAmount))
                        .font(.title2)
                        .fontWeight(.bold)
                }
                .foregroundColor(.tuckerOrange)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
    }

    // MARK: - Order Info Section
    private func orderInfoSection(order: Order) -> some View {
        VStack(spacing: 12) {
            InfoRow(title: "Order Number", value: order.orderNo)
            InfoRow(title: "Order Time", value: formatDate(order.createdAt))
            if let paidAt = order.paidAt {
                InfoRow(title: "Payment Time", value: formatDate(paidAt))
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
    }

    // MARK: - Bottom Actions
    private func bottomActions(order: Order) -> some View {
        HStack(spacing: 12) {
            // Contact Support
            Button {
                // Contact support action
            } label: {
                HStack {
                    Image(systemName: "headphones")
                    Text("Support")
                }
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.primary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color(.systemGray5))
                .cornerRadius(22)
            }

            // Primary Action
            if order.status == "pending" {
                Button {
                    // Cancel order
                } label: {
                    Text("Cancel Order")
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.red)
                        .cornerRadius(22)
                }
            } else if order.status == "completed" {
                NavigationLink(destination: MerchantDetailView(merchantId: order.merchantId)) {
                    Text("Reorder")
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(
                            LinearGradient(colors: [.tuckerOrange, .red], startPoint: .leading, endPoint: .trailing)
                        )
                        .cornerRadius(22)
                }
            } else {
                Button {
                    // Track order
                } label: {
                    HStack {
                        Image(systemName: "location.circle")
                        Text("Track Order")
                    }
                    .font(.subheadline)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(
                        LinearGradient(colors: [.tuckerOrange, .red], startPoint: .leading, endPoint: .trailing)
                    )
                    .cornerRadius(22)
                }
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 12)
        .background(Color.white)
        .shadow(color: .black.opacity(0.08), radius: 8, y: -4)
    }

    // MARK: - Helper Functions

    private func loadOrder() async {
        isLoading = true
        error = nil
        do {
            order = try await APIService.shared.getOrder(id: orderId)
        } catch {
            self.error = "Failed to load order details"
            print("Error loading order: \(error)")
        }
        isLoading = false
    }

    private func statusColor(_ status: String) -> Color {
        switch status {
        case "completed": return .green
        case "cancelled": return .red
        case "delivering": return .blue
        case "preparing": return .orange
        case "pending": return .gray
        default: return .tuckerOrange
        }
    }

    private func statusIcon(_ status: String) -> String {
        switch status {
        case "completed": return "checkmark.circle.fill"
        case "cancelled": return "xmark.circle.fill"
        case "delivering": return "bicycle"
        case "preparing": return "flame.fill"
        case "pending": return "clock.fill"
        default: return "bag.fill"
        }
    }

    private func statusText(_ status: String) -> String {
        switch status {
        case "completed": return "Order Completed"
        case "cancelled": return "Order Cancelled"
        case "delivering": return "On the Way"
        case "preparing": return "Being Prepared"
        case "pending": return "Awaiting Payment"
        case "paid": return "Order Placed"
        default: return status.capitalized
        }
    }

    private func statusDescription(_ status: String) -> String {
        switch status {
        case "completed": return "Thank you for your order! We hope you enjoyed your meal."
        case "cancelled": return "This order has been cancelled."
        case "delivering": return "Your order is on its way! The driver will arrive soon."
        case "preparing": return "The restaurant is preparing your delicious meal."
        case "pending": return "Please complete your payment to confirm the order."
        case "paid": return "Your order has been received and will be prepared shortly."
        default: return ""
        }
    }

    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "d MMM yyyy, h:mm a"
            return displayFormatter.string(from: date)
        }
        return dateString
    }
}

// MARK: - Info Row
struct InfoRow: View {
    let title: String
    let value: String

    var body: some View {
        HStack {
            Text(title)
                .font(.subheadline)
                .foregroundColor(.gray)
            Spacer()
            Text(value)
                .font(.subheadline)
                .foregroundColor(.primary)
        }
    }
}

#Preview {
    NavigationStack {
        OrderDetailView(orderId: "1")
    }
}
