import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var viewModel = DashboardViewModel()

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Store Status Card
                    if let merchant = viewModel.merchant {
                        StoreStatusCard(merchant: merchant, onToggle: {
                            viewModel.toggleStoreOpen()
                        })
                    }

                    // Today's Stats
                    if let stats = viewModel.stats {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Today")
                                .font(.headline)

                            HStack(spacing: 16) {
                                StatCard(
                                    title: "Orders",
                                    value: "\(stats.todayOrders)",
                                    icon: "bag.fill",
                                    color: .tuckerInfo
                                )

                                StatCard(
                                    title: "Revenue",
                                    value: String(format: "¥%.2f", stats.todayRevenue),
                                    icon: "dollarsign.circle.fill",
                                    color: .tuckerSuccess
                                )
                            }

                            HStack(spacing: 16) {
                                StatCard(
                                    title: "Pending",
                                    value: "\(stats.pendingOrders)",
                                    icon: "clock.fill",
                                    color: .tuckerPrimary
                                )

                                StatCard(
                                    title: "Rating",
                                    value: String(format: "%.1f", stats.averageRating),
                                    icon: "star.fill",
                                    color: .tuckerSecondary
                                )
                            }
                        }
                    }

                    // Overall Stats
                    if let stats = viewModel.stats {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Overall")
                                .font(.headline)
                                .foregroundColor(.tuckerTextPrimary)

                            HStack(spacing: 16) {
                                StatCard(
                                    title: "Total Orders",
                                    value: "\(stats.totalOrders)",
                                    icon: "shippingbox.fill",
                                    color: .tuckerOchre
                                )

                                StatCard(
                                    title: "Total Revenue",
                                    value: String(format: "¥%.0f", stats.totalRevenue),
                                    icon: "banknote.fill",
                                    color: .tuckerSuccess
                                )
                            }
                        }
                    }

                    Spacer(minLength: 20)
                }
                .padding()
            }
            .navigationTitle("Dashboard")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        authManager.logout()
                    } label: {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                    }
                }
            }
            .refreshable {
                await viewModel.refresh()
            }
            .task {
                await viewModel.loadData()
            }
        }
    }
}

struct StoreStatusCard: View {
    let merchant: Merchant
    let onToggle: () -> Void

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(merchant.name)
                    .font(.headline)
                    .foregroundColor(.tuckerTextPrimary)

                HStack {
                    Circle()
                        .fill(merchant.isOpen ? Color.tuckerSuccess : Color.tuckerError)
                        .frame(width: 8, height: 8)

                    Text(merchant.isOpen ? "Open" : "Closed")
                        .font(.subheadline)
                        .foregroundColor(merchant.isOpen ? .tuckerSuccess : .tuckerError)
                }
            }

            Spacer()

            Toggle("", isOn: Binding(
                get: { merchant.isOpen },
                set: { _ in onToggle() }
            ))
            .labelsHidden()
            .tint(.tuckerPrimary)
        }
        .padding()
        .background(Color.tuckerSurface)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 4, y: 2)
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Spacer()
            }

            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.tuckerTextPrimary)

            Text(title)
                .font(.caption)
                .foregroundColor(.tuckerTextSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.tuckerSurface)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 4, y: 2)
    }
}
