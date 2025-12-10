import SwiftUI

enum OrderStatusFilter: String, CaseIterable {
    case all = "All"
    case pending = "Pending"
    case active = "Active"
    case completed = "Completed"
}

struct OrdersView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var orders: [Order] = []
    @State private var isLoading = true
    @State private var selectedFilter: OrderStatusFilter = .all

    var filteredOrders: [Order] {
        switch selectedFilter {
        case .all:
            return orders
        case .pending:
            return orders.filter { $0.status == "pending" }
        case .active:
            return orders.filter { ["paid", "preparing", "delivering"].contains($0.status) }
        case .completed:
            return orders.filter { ["completed", "cancelled"].contains($0.status) }
        }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if authManager.isAuthenticated {
                    // Status Tabs
                    statusTabs
                }

                // Content
                Group {
                    if !authManager.isAuthenticated {
                        notLoggedInView
                    } else if isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else if filteredOrders.isEmpty {
                        emptyStateView
                    } else {
                        ordersList
                    }
                }
            }
            .background(Color(.systemGray6))
            .navigationTitle("Orders")
        }
        .task {
            if authManager.isAuthenticated {
                await loadOrders()
            }
        }
    }

    // MARK: - Status Tabs
    private var statusTabs: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(OrderStatusFilter.allCases, id: \.self) { filter in
                    StatusTabButton(
                        title: filter.rawValue,
                        isSelected: selectedFilter == filter,
                        count: countForFilter(filter)
                    ) {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedFilter = filter
                        }
                    }
                }
            }
            .padding(.horizontal)
        }
        .padding(.vertical, 12)
        .background(Color.white)
    }

    private func countForFilter(_ filter: OrderStatusFilter) -> Int {
        switch filter {
        case .all: return orders.count
        case .pending: return orders.filter { $0.status == "pending" }.count
        case .active: return orders.filter { ["paid", "preparing", "delivering"].contains($0.status) }.count
        case .completed: return orders.filter { ["completed", "cancelled"].contains($0.status) }.count
        }
    }

    // MARK: - Not Logged In
    private var notLoggedInView: some View {
        VStack(spacing: 16) {
            Image(systemName: "bag")
                .font(.system(size: 64))
                .foregroundColor(.gray)
            Text("Please login to view orders")
                .foregroundColor(.gray)
            NavigationLink(destination: LoginView()) {
                Text("Login")
                    .fontWeight(.medium)
                    .foregroundColor(.white)
                    .padding(.horizontal, 32)
                    .padding(.vertical, 12)
                    .background(Color.tuckerOrange)
                    .cornerRadius(20)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Empty State
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: emptyStateIcon)
                .font(.system(size: 64))
                .foregroundColor(.gray)
            Text(emptyStateTitle)
                .font(.headline)
                .foregroundColor(.gray)
            Text(emptyStateSubtitle)
                .font(.caption)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var emptyStateIcon: String {
        switch selectedFilter {
        case .all: return "bag"
        case .pending: return "clock"
        case .active: return "bicycle"
        case .completed: return "checkmark.circle"
        }
    }

    private var emptyStateTitle: String {
        switch selectedFilter {
        case .all: return "No orders yet"
        case .pending: return "No pending orders"
        case .active: return "No active orders"
        case .completed: return "No completed orders"
        }
    }

    private var emptyStateSubtitle: String {
        switch selectedFilter {
        case .all: return "Your order history will appear here"
        case .pending: return "Orders awaiting payment will appear here"
        case .active: return "Orders being prepared or delivered will appear here"
        case .completed: return "Your past orders will appear here"
        }
    }

    // MARK: - Orders List
    private var ordersList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(filteredOrders) { order in
                    NavigationLink(destination: OrderDetailView(orderId: order.id)) {
                        OrderCard(order: order)
                    }
                    .buttonStyle(PlainButtonStyle())
                }
            }
            .padding()
        }
        .refreshable {
            await loadOrders()
        }
    }

    private func loadOrders() async {
        isLoading = true
        do {
            let response = try await APIService.shared.getOrders()
            orders = response.items
        } catch {
            print("Error loading orders: \(error)")
        }
        isLoading = false
    }
}

// MARK: - Status Tab Button
struct StatusTabButton: View {
    let title: String
    let isSelected: Bool
    let count: Int
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(isSelected ? .semibold : .regular)

                if count > 0 && !isSelected {
                    Text("\(count)")
                        .font(.caption2)
                        .fontWeight(.medium)
                        .foregroundColor(.white)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.red)
                        .clipShape(Capsule())
                }
            }
            .foregroundColor(isSelected ? .white : .primary)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(isSelected ? Color.tuckerOrange : Color(.systemGray6))
            .cornerRadius(18)
        }
    }
}

struct OrderCard: View {
    let order: Order

    var statusColor: Color {
        switch order.status {
        case "completed": return .green
        case "cancelled": return .red
        case "delivering": return .blue
        default: return .tuckerOrange
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(order.merchantName ?? "Restaurant")
                    .font(.headline)
                Spacer()
                Text(order.status.capitalized)
                    .font(.caption)
                    .foregroundColor(statusColor)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(statusColor.opacity(0.1))
                    .cornerRadius(4)
            }

            Divider()

            ForEach(order.items ?? []) { item in
                HStack {
                    Text(item.productName)
                        .font(.subheadline)
                    Spacer()
                    Text("x\(item.quantity)")
                        .foregroundColor(.gray)
                    Text("$\(Int(item.price))")
                        .foregroundColor(.tuckerOrange)
                }
            }

            Divider()

            HStack {
                Text(formatDate(order.createdAt))
                    .font(.caption)
                    .foregroundColor(.gray)
                Spacer()
                Text("Total: $\(String(format: "%.2f", order.totalAmount))")
                    .fontWeight(.medium)
                    .foregroundColor(.tuckerOrange)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }

    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "MMM d, yyyy HH:mm"
            return displayFormatter.string(from: date)
        }
        return dateString
    }
}

#Preview {
    OrdersView()
        .environmentObject(AuthManager())
}
