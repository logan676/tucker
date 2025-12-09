import SwiftUI

struct OrdersView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var orders: [Order] = []
    @State private var isLoading = true

    var body: some View {
        NavigationStack {
            Group {
                if !authManager.isAuthenticated {
                    // Not logged in
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
                                .background(Color.orange)
                                .cornerRadius(20)
                        }
                    }
                } else if isLoading {
                    ProgressView()
                } else if orders.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "bag")
                            .font(.system(size: 64))
                            .foregroundColor(.gray)
                        Text("No orders yet")
                            .foregroundColor(.gray)
                        Text("Your order history will appear here")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                } else {
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(orders) { order in
                                OrderCard(order: order)
                            }
                        }
                        .padding()
                    }
                    .refreshable {
                        await loadOrders()
                    }
                }
            }
            .navigationTitle("Orders")
        }
        .task {
            if authManager.isAuthenticated {
                await loadOrders()
            }
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

struct OrderCard: View {
    let order: Order

    var statusColor: Color {
        switch order.status {
        case "completed": return .green
        case "cancelled": return .red
        case "delivering": return .blue
        default: return .orange
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
                    Text("¥\(Int(item.price))")
                        .foregroundColor(.orange)
                }
            }

            Divider()

            HStack {
                Text(formatDate(order.createdAt))
                    .font(.caption)
                    .foregroundColor(.gray)
                Spacer()
                Text("Total: ¥\(String(format: "%.2f", order.totalAmount))")
                    .fontWeight(.medium)
                    .foregroundColor(.orange)
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
