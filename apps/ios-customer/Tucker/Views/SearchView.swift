import SwiftUI

enum SortOption: String, CaseIterable {
    case recommended = "Recommended"
    case rating = "Rating"
    case distance = "Distance"
    case sales = "Sales"
    case deliveryTime = "Delivery Time"
}

struct SearchView: View {
    @State private var searchText = ""
    @State private var merchants: [Merchant] = []
    @State private var allMerchants: [Merchant] = []
    @State private var categories: [Category] = []
    @State private var isLoading = false
    @State private var hasSearched = false
    @State private var selectedSort: SortOption = .recommended
    @State private var showFilters = false
    @State private var selectedCategoryId: String?

    // Filters
    @State private var maxDeliveryFee: Double = 10
    @State private var maxDeliveryTime: Int = 60
    @State private var minRating: Double = 0

    var body: some View {
        VStack(spacing: 0) {
            // Search Bar
            searchBar

            // Filter Bar
            filterBar

            // Results
            if isLoading {
                Spacer()
                ProgressView()
                Spacer()
            } else if merchants.isEmpty && hasSearched {
                emptyState
            } else if !hasSearched && allMerchants.isEmpty {
                initialState
            } else {
                resultsList
            }
        }
        .background(Color(.systemGray6))
        .navigationTitle("Search")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showFilters) {
            FilterSheet(
                maxDeliveryFee: $maxDeliveryFee,
                maxDeliveryTime: $maxDeliveryTime,
                minRating: $minRating,
                onApply: { applyFilters() }
            )
        }
        .task {
            await loadInitialData()
        }
    }

    // MARK: - Search Bar
    private var searchBar: some View {
        HStack(spacing: 12) {
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.gray)
                TextField("Search restaurants or dishes...", text: $searchText)
                    .onChange(of: searchText) { _ in
                        filterMerchants()
                    }
                if !searchText.isEmpty {
                    Button {
                        searchText = ""
                        filterMerchants()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.gray)
                    }
                }
            }
            .padding(10)
            .background(Color(.systemGray6))
            .cornerRadius(10)

            Button("Search") {
                hasSearched = true
                filterMerchants()
            }
            .foregroundColor(.tuckerOrange)
        }
        .padding()
        .background(Color.white)
    }

    // MARK: - Filter Bar
    private var filterBar: some View {
        VStack(spacing: 0) {
            // Categories
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    CategoryPill(title: "All", isSelected: selectedCategoryId == nil) {
                        selectedCategoryId = nil
                        filterMerchants()
                    }

                    ForEach(categories) { category in
                        CategoryPill(
                            title: "\(category.icon ?? "") \(category.name)",
                            isSelected: selectedCategoryId == category.id
                        ) {
                            selectedCategoryId = category.id
                            filterMerchants()
                        }
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical, 8)

            Divider()

            // Sort and Filter options
            HStack(spacing: 16) {
                // Sort options
                Menu {
                    ForEach(SortOption.allCases, id: \.self) { option in
                        Button {
                            selectedSort = option
                            sortMerchants()
                        } label: {
                            HStack {
                                Text(option.rawValue)
                                if selectedSort == option {
                                    Image(systemName: "checkmark")
                                }
                            }
                        }
                    }
                } label: {
                    HStack(spacing: 4) {
                        Text(selectedSort.rawValue)
                            .font(.caption)
                        Image(systemName: "chevron.down")
                            .font(.caption2)
                    }
                    .foregroundColor(.primary)
                }

                Divider()
                    .frame(height: 20)

                // Quick filters
                QuickFilterButton(title: "Delivery ≤¥\(Int(maxDeliveryFee))", isActive: maxDeliveryFee < 10) {
                    showFilters = true
                }

                QuickFilterButton(title: "Rating ≥\(String(format: "%.1f", minRating))", isActive: minRating > 0) {
                    showFilters = true
                }

                Spacer()

                // Filter button
                Button {
                    showFilters = true
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "slider.horizontal.3")
                        Text("Filters")
                            .font(.caption)
                    }
                    .foregroundColor(.tuckerOrange)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.tuckerOrange.opacity(0.1))
                    .cornerRadius(16)
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
        }
        .background(Color.white)
    }

    // MARK: - Results List
    private var resultsList: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                ForEach(merchants) { merchant in
                    NavigationLink(destination: MerchantDetailView(merchantId: merchant.id)) {
                        SearchMerchantCard(merchant: merchant)
                    }
                    Divider()
                }
            }
            .background(Color.white)
        }
    }

    // MARK: - Empty State
    private var emptyState: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "magnifyingglass")
                .font(.system(size: 48))
                .foregroundColor(.gray)
            Text("No results found")
                .font(.headline)
                .foregroundColor(.gray)
            Text("Try adjusting your filters or search term")
                .font(.caption)
                .foregroundColor(.gray)
            Spacer()
        }
    }

    // MARK: - Initial State
    private var initialState: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "magnifyingglass")
                .font(.system(size: 48))
                .foregroundColor(.gray)
            Text("Discover restaurants")
                .font(.headline)
                .foregroundColor(.gray)
            Text("Search by name, cuisine, or dish")
                .font(.caption)
                .foregroundColor(.gray)
            Spacer()
        }
    }

    // MARK: - Data Loading
    private func loadInitialData() async {
        isLoading = true
        do {
            async let categoriesResult = APIService.shared.getCategories()
            async let merchantsResult = APIService.shared.getMerchants()

            let (cats, merchResponse) = try await (categoriesResult, merchantsResult)
            categories = cats
            allMerchants = merchResponse.items
            merchants = allMerchants
        } catch {
            print("Error loading data: \(error)")
        }
        isLoading = false
    }

    private func filterMerchants() {
        var filtered = allMerchants

        // Search text filter
        if !searchText.isEmpty {
            filtered = filtered.filter { merchant in
                merchant.name.localizedCaseInsensitiveContains(searchText)
            }
        }

        // Delivery fee filter
        filtered = filtered.filter { $0.deliveryFee <= maxDeliveryFee }

        // Rating filter
        filtered = filtered.filter { $0.rating >= minRating }

        merchants = filtered
        sortMerchants()
    }

    private func sortMerchants() {
        switch selectedSort {
        case .recommended:
            merchants.sort { $0.monthlySales > $1.monthlySales }
        case .rating:
            merchants.sort { $0.rating > $1.rating }
        case .distance:
            // Would need location data
            break
        case .sales:
            merchants.sort { $0.monthlySales > $1.monthlySales }
        case .deliveryTime:
            // Parse delivery time strings and sort
            break
        }
    }

    private func applyFilters() {
        filterMerchants()
    }
}

// MARK: - Supporting Views

struct CategoryPill: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.caption)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? Color.tuckerOrange : Color(.systemGray6))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(16)
        }
    }
}

struct QuickFilterButton: View {
    let title: String
    let isActive: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.caption2)
                .foregroundColor(isActive ? .tuckerOrange : .gray)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(isActive ? Color.tuckerOrange.opacity(0.1) : Color.clear)
                .cornerRadius(8)
        }
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
            .frame(width: 80, height: 80)
            .cornerRadius(8)

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(merchant.name)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                        .lineLimit(1)

                    if !merchant.isOpen {
                        Text("Closed")
                            .font(.caption2)
                            .foregroundColor(.white)
                            .padding(.horizontal, 4)
                            .padding(.vertical, 2)
                            .background(Color.gray)
                            .cornerRadius(2)
                    }
                }

                HStack(spacing: 8) {
                    HStack(spacing: 2) {
                        Image(systemName: "star.fill")
                            .foregroundColor(.tuckerOrange)
                            .font(.caption2)
                        Text(String(format: "%.1f", merchant.rating))
                            .foregroundColor(.tuckerOrange)
                            .font(.caption)
                            .fontWeight(.medium)
                    }
                    Text("\(merchant.monthlySales)+ sold")
                        .foregroundColor(.gray)
                        .font(.caption)
                }

                HStack(spacing: 8) {
                    HStack(spacing: 2) {
                        Image(systemName: "clock")
                            .font(.caption2)
                        Text(merchant.deliveryTime ?? "30-45 min")
                            .font(.caption)
                    }
                    .foregroundColor(.gray)

                    Text("¥\(Int(merchant.deliveryFee)) delivery")
                        .font(.caption)
                        .foregroundColor(.gray)

                    Text("Min ¥\(Int(merchant.minOrderAmount))")
                        .font(.caption)
                        .foregroundColor(.gray)
                }

                HStack(spacing: 4) {
                    Text("New Customer -¥5")
                        .font(.caption2)
                        .foregroundColor(.red)
                        .padding(.horizontal, 4)
                        .padding(.vertical, 2)
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(2)
                }
            }

            Spacer()
        }
        .padding()
    }
}

// MARK: - Filter Sheet

struct FilterSheet: View {
    @Environment(\.dismiss) var dismiss
    @Binding var maxDeliveryFee: Double
    @Binding var maxDeliveryTime: Int
    @Binding var minRating: Double
    let onApply: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section("Delivery Fee") {
                    VStack(alignment: .leading) {
                        Text("Max ¥\(Int(maxDeliveryFee))")
                            .font(.subheadline)
                        Slider(value: $maxDeliveryFee, in: 0...20, step: 1)
                            .tint(.tuckerOrange)
                    }
                }

                Section("Minimum Rating") {
                    VStack(alignment: .leading) {
                        HStack {
                            Text(String(format: "%.1f", minRating))
                                .font(.subheadline)
                            ForEach(0..<5) { index in
                                Image(systemName: Double(index) < minRating ? "star.fill" : "star")
                                    .foregroundColor(.tuckerOrange)
                                    .font(.caption)
                            }
                        }
                        Slider(value: $minRating, in: 0...5, step: 0.5)
                            .tint(.tuckerOrange)
                    }
                }

                Section("Delivery Time") {
                    VStack(alignment: .leading) {
                        Text("Within \(maxDeliveryTime) minutes")
                            .font(.subheadline)
                        Slider(value: Binding(
                            get: { Double(maxDeliveryTime) },
                            set: { maxDeliveryTime = Int($0) }
                        ), in: 15...120, step: 15)
                            .tint(.tuckerOrange)
                    }
                }

                Section {
                    Button {
                        maxDeliveryFee = 10
                        maxDeliveryTime = 60
                        minRating = 0
                    } label: {
                        Text("Reset Filters")
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Apply") {
                        onApply()
                        dismiss()
                    }
                    .fontWeight(.bold)
                    .foregroundColor(.tuckerOrange)
                }
            }
        }
    }
}

#Preview {
    NavigationStack {
        SearchView()
    }
}
