import SwiftUI

struct HomeView: View {
    @State private var categories: [Category] = []
    @State private var merchants: [Merchant] = []
    @State private var isLoading = true
    @State private var searchText = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Search Bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.gray)
                        TextField("Search restaurants or dishes...", text: $searchText)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(10)
                    .padding(.horizontal)

                    // Categories
                    VStack(alignment: .leading) {
                        Text("Categories")
                            .font(.headline)
                            .padding(.horizontal)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 16) {
                                ForEach(categories) { category in
                                    NavigationLink(destination: SearchView()) {
                                        VStack {
                                            Text(category.icon ?? "🍽️")
                                                .font(.system(size: 32))
                                                .frame(width: 56, height: 56)
                                                .background(Color.orange.opacity(0.1))
                                                .cornerRadius(28)

                                            Text(category.name)
                                                .font(.caption)
                                                .foregroundColor(.primary)
                                        }
                                    }
                                }
                            }
                            .padding(.horizontal)
                        }
                    }

                    // Merchants
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Nearby Restaurants")
                            .font(.headline)
                            .padding(.horizontal)

                        if isLoading {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                                .padding()
                        } else if merchants.isEmpty {
                            Text("No restaurants available")
                                .foregroundColor(.gray)
                                .frame(maxWidth: .infinity)
                                .padding()
                        } else {
                            LazyVStack(spacing: 12) {
                                ForEach(merchants) { merchant in
                                    NavigationLink(destination: MerchantDetailView(merchantId: merchant.id)) {
                                        MerchantCard(merchant: merchant)
                                    }
                                }
                            }
                            .padding(.horizontal)
                        }
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Tucker")
            .refreshable {
                await loadData()
            }
        }
        .task {
            await loadData()
        }
    }

    private func loadData() async {
        isLoading = true
        do {
            async let categoriesResult = APIService.shared.getCategories()
            async let merchantsResult = APIService.shared.getMerchants()

            let (cats, merchResponse) = try await (categoriesResult, merchantsResult)
            categories = cats
            merchants = merchResponse.items
        } catch {
            print("Error loading data: \(error)")
        }
        isLoading = false
    }
}

struct MerchantCard: View {
    let merchant: Merchant

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: merchant.logo ?? "")) { image in
                image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle().fill(Color.gray.opacity(0.2))
            }
            .frame(width: 80, height: 80)
            .cornerRadius(8)

            VStack(alignment: .leading, spacing: 4) {
                Text(merchant.name)
                    .font(.headline)
                    .foregroundColor(.primary)

                HStack(spacing: 4) {
                    Image(systemName: "star.fill")
                        .foregroundColor(.orange)
                        .font(.caption)
                    Text(String(format: "%.1f", merchant.rating))
                        .foregroundColor(.orange)
                        .font(.caption)
                    Text("•")
                        .foregroundColor(.gray)
                    Text("\(merchant.monthlySales) sold/month")
                        .foregroundColor(.gray)
                        .font(.caption)
                }

                HStack(spacing: 8) {
                    Text(merchant.deliveryTime ?? "30-45 min")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text("Delivery ¥\(Int(merchant.deliveryFee))")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text("Min ¥\(Int(merchant.minOrderAmount))")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }

            Spacer()
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}

#Preview {
    HomeView()
}
