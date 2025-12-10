import SwiftUI

struct OrdersView: View {
    @StateObject private var viewModel = OrdersViewModel()
    @State private var selectedStatus: OrderStatus? = nil

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Status Filter
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        StatusFilterButton(title: "All", isSelected: selectedStatus == nil) {
                            selectedStatus = nil
                            viewModel.loadOrders(status: nil)
                        }

                        ForEach([OrderStatus.pendingConfirm, .preparing, .ready, .delivering], id: \.self) { status in
                            StatusFilterButton(
                                title: status.displayName,
                                isSelected: selectedStatus == status
                            ) {
                                selectedStatus = status
                                viewModel.loadOrders(status: status)
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                }
                .background(Color(.systemBackground))

                // Orders List
                if viewModel.isLoading && viewModel.orders.isEmpty {
                    Spacer()
                    ProgressView()
                    Spacer()
                } else if viewModel.orders.isEmpty {
                    Spacer()
                    VStack(spacing: 12) {
                        Image(systemName: "tray")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary)
                        Text("No orders")
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                } else {
                    List {
                        ForEach(viewModel.orders) { order in
                            NavigationLink {
                                OrderDetailView(order: order, onStatusUpdate: {
                                    viewModel.loadOrders(status: selectedStatus)
                                })
                            } label: {
                                OrderRowView(order: order)
                            }
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Orders")
            .refreshable {
                viewModel.loadOrders(status: selectedStatus)
            }
            .task {
                viewModel.loadOrders(status: selectedStatus)
            }
        }
    }
}

struct StatusFilterButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color.tuckerPrimary : Color.tuckerBackground)
                .foregroundColor(isSelected ? .white : .tuckerTextPrimary)
                .cornerRadius(20)
        }
    }
}

struct OrderRowView: View {
    let order: Order

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("#\(order.orderNo)")
                    .font(.headline)
                    .foregroundColor(.tuckerTextPrimary)

                Spacer()

                StatusBadge(status: order.status)
            }

            if let items = order.items, !items.isEmpty {
                Text(items.map { "\($0.name) x\($0.quantity)" }.joined(separator: ", "))
                    .font(.subheadline)
                    .foregroundColor(.tuckerTextSecondary)
                    .lineLimit(2)
            }

            HStack {
                Text(order.createdAt)
                    .font(.caption)
                    .foregroundColor(.tuckerTextSecondary)

                Spacer()

                Text(String(format: "¥%.2f", order.payAmount))
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.tuckerPrimary)
            }
        }
        .padding(.vertical, 8)
    }
}

struct StatusBadge: View {
    let status: OrderStatus

    var body: some View {
        Text(status.displayName)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(statusColor.opacity(0.2))
            .foregroundColor(statusColor)
            .cornerRadius(8)
    }

    var statusColor: Color {
        switch status {
        case .pendingPayment: return .tuckerPrimary
        case .pendingConfirm: return .tuckerInfo
        case .preparing: return .tuckerSecondary
        case .ready: return .tuckerSuccess
        case .delivering: return .tuckerInfo
        case .completed: return .tuckerTextSecondary
        case .cancelled, .refunded: return .tuckerError
        }
    }
}
