import SwiftUI

struct OrderDetailView: View {
    let order: Order
    let onStatusUpdate: () -> Void

    @State private var isUpdating = false
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Order Header
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("#\(order.orderNo)")
                            .font(.title2)
                            .fontWeight(.bold)

                        Spacer()

                        StatusBadge(status: order.status)
                    }

                    Text(order.createdAt)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)

                // Delivery Address
                if let address = order.deliveryAddress {
                    VStack(alignment: .leading, spacing: 8) {
                        Label("Delivery Address", systemImage: "location.fill")
                            .font(.headline)

                        VStack(alignment: .leading, spacing: 4) {
                            Text("\(address.name)  \(address.phone)")
                                .font(.subheadline)

                            Text(address.fullAddress)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                }

                // Order Items
                VStack(alignment: .leading, spacing: 12) {
                    Label("Items", systemImage: "bag.fill")
                        .font(.headline)

                    if let items = order.items {
                        ForEach(items) { item in
                            HStack {
                                AsyncImage(url: URL(string: item.image ?? "")) { image in
                                    image.resizable().aspectRatio(contentMode: .fill)
                                } placeholder: {
                                    Color.gray.opacity(0.2)
                                }
                                .frame(width: 50, height: 50)
                                .cornerRadius(8)

                                VStack(alignment: .leading) {
                                    Text(item.name)
                                        .font(.subheadline)

                                    if let options = item.options, !options.isEmpty {
                                        Text(options.joined(separator: ", "))
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                }

                                Spacer()

                                Text("x\(item.quantity)")
                                    .foregroundColor(.secondary)

                                Text(String(format: "¥%.2f", item.price))
                            }
                        }
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)

                // Order Summary
                VStack(spacing: 8) {
                    HStack {
                        Text("Subtotal")
                            .foregroundColor(.tuckerTextSecondary)
                        Spacer()
                        Text(String(format: "¥%.2f", order.totalAmount))
                            .foregroundColor(.tuckerTextPrimary)
                    }

                    HStack {
                        Text("Delivery Fee")
                            .foregroundColor(.tuckerTextSecondary)
                        Spacer()
                        Text(String(format: "¥%.2f", order.deliveryFee))
                            .foregroundColor(.tuckerTextPrimary)
                    }

                    if order.discountAmount > 0 {
                        HStack {
                            Text("Discount")
                                .foregroundColor(.tuckerTextSecondary)
                            Spacer()
                            Text(String(format: "-¥%.2f", order.discountAmount))
                                .foregroundColor(.tuckerSuccess)
                        }
                    }

                    Divider()

                    HStack {
                        Text("Total")
                            .fontWeight(.semibold)
                            .foregroundColor(.tuckerTextPrimary)
                        Spacer()
                        Text(String(format: "¥%.2f", order.payAmount))
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundColor(.tuckerPrimary)
                    }
                }
                .font(.subheadline)
                .padding()
                .background(Color.tuckerSurface)
                .cornerRadius(12)

                // Remark
                if let remark = order.remark, !remark.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Label("Remark", systemImage: "note.text")
                            .font(.headline)

                        Text(remark)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                }

                // Action Button
                if let nextStatus = order.status.nextStatus {
                    Button {
                        updateStatus(to: nextStatus)
                    } label: {
                        if isUpdating {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        } else {
                            Text(actionButtonTitle(for: order.status))
                                .fontWeight(.semibold)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.tuckerPrimary)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                    .disabled(isUpdating)
                }

                // Cancel Button (only for pending orders)
                if order.status == .pendingConfirm {
                    Button {
                        updateStatus(to: .cancelled)
                    } label: {
                        Text("Cancel Order")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.tuckerError.opacity(0.1))
                    .foregroundColor(.tuckerError)
                    .cornerRadius(12)
                    .disabled(isUpdating)
                }

                Spacer(minLength: 20)
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Order Details")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func actionButtonTitle(for status: OrderStatus) -> String {
        switch status {
        case .pendingConfirm: return "Accept Order"
        case .preparing: return "Mark as Ready"
        case .ready: return "Start Delivery"
        case .delivering: return "Complete Order"
        default: return ""
        }
    }

    private func updateStatus(to status: OrderStatus) {
        isUpdating = true

        Task {
            do {
                _ = try await APIService.shared.updateOrderStatus(
                    orderId: order.id,
                    status: status,
                    reason: status == .cancelled ? "Cancelled by merchant" : nil
                )
                onStatusUpdate()
                dismiss()
            } catch {
                // Handle error
            }
            isUpdating = false
        }
    }
}
