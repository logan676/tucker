import SwiftUI

struct SearchView: View {
    @State private var searchText = ""
    @State private var merchants: [Merchant] = []
    @State private var isLoading = false
    @State private var hasSearched = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.gray)
                    TextField("Search restaurants or dishes...", text: $searchText)
                        .onSubmit {
                            Task { await search() }
                        }
                    if !searchText.isEmpty {
                        Button {
                            searchText = ""
                            merchants = []
                            hasSearched = false
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.gray)
                        }
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)
                .padding()

                // Results
                if isLoading {
                    Spacer()
                    ProgressView()
                    Spacer()
                } else if hasSearched && merchants.isEmpty {
                    Spacer()
                    VStack(spacing: 12) {
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 48))
                            .foregroundColor(.gray)
                        Text("No results found")
                            .foregroundColor(.gray)
                        Text("Try searching for something else")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    Spacer()
                } else if !hasSearched {
                    Spacer()
                    VStack(spacing: 12) {
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 48))
                            .foregroundColor(.gray)
                        Text("Search for restaurants")
                            .foregroundColor(.gray)
                    }
                    Spacer()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(merchants) { merchant in
                                NavigationLink(destination: MerchantDetailView(merchantId: merchant.id)) {
                                    SearchMerchantCard(merchant: merchant)
                                }
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Search")
        }
    }

    private func search() async {
        guard !searchText.isEmpty else { return }

        isLoading = true
        hasSearched = true

        do {
            let response = try await APIService.shared.getMerchants()
            // Filter locally for now - in real app, this would be server-side search
            merchants = response.items.filter { merchant in
                merchant.name.localizedCaseInsensitiveContains(searchText)
            }
        } catch {
            print("Search error: \(error)")
        }

        isLoading = false
    }
}

struct SearchMerchantCard: View {
    let merchant: Merchant

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: merchant.logo ?? "")) { image in
                image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle().fill(Color.gray.opacity(0.2))
            }
            .frame(width: 70, height: 70)
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
                }

                HStack(spacing: 8) {
                    Text(merchant.deliveryTime ?? "30-45 min")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text("¥\(Int(merchant.deliveryFee)) delivery")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .foregroundColor(.gray)
                .font(.caption)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}

#Preview {
    SearchView()
}
