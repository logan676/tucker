import SwiftUI

struct HomeView: View {
    @StateObject private var locationManager = LocationManager.shared
    @State private var categories: [Category] = []
    @State private var merchants: [Merchant] = []
    @State private var banners: [BannerItem] = []
    @State private var isLoading = true
    @State private var searchText = ""
    @State private var currentBannerIndex = 0

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    // Header with location
                    headerView

                    // Search Bar
                    searchBarView

                    // Banner Carousel
                    bannerCarousel

                    // Quick Action Buttons
                    quickActions

                    // Categories Grid
                    categoriesSection

                    // Flash Deals
                    flashDealsSection

                    // Nearby Restaurants
                    nearbyRestaurantsSection
                }
            }
            .background(Color.tuckerBackground)
            .refreshable {
                await loadData()
            }
        }
        .task {
            await loadData()
        }
    }

    // MARK: - Header View
    private var headerView: some View {
        HStack {
            Button {
                locationManager.requestPermission()
                locationManager.startUpdating()
            } label: {
                HStack(spacing: 4) {
                    if locationManager.isLoading {
                        ProgressView()
                            .scaleEffect(0.7)
                    } else {
                        Image(systemName: "location.fill")
                            .foregroundColor(.tuckerOrange)
                            .font(.caption)
                    }
                    Text(locationManager.locationName)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.tuckerTextPrimary)
                    Image(systemName: "chevron.down")
                        .font(.caption2)
                        .foregroundColor(.tuckerTextSecondary)
                }
            }
            Spacer()
            Image(systemName: "bell")
                .font(.title3)
                .foregroundColor(.tuckerTextSecondary)
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
        .background(Color.tuckerSurface)
    }

    // MARK: - Search Bar
    private var searchBarView: some View {
        NavigationLink(destination: SearchView()) {
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.tuckerTextSecondary)
                Text("Search restaurants or dishes...")
                    .foregroundColor(.tuckerTextSecondary)
                Spacer()
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(Color.tuckerBackground)
            .cornerRadius(20)
            .padding(.horizontal)
            .padding(.bottom, 8)
        }
        .background(Color.tuckerSurface)
    }

    // MARK: - Banner Carousel
    private var bannerCarousel: some View {
        Group {
            if !banners.isEmpty {
                VStack(spacing: 8) {
                    TabView(selection: $currentBannerIndex) {
                        ForEach(Array(banners.prefix(5).enumerated()), id: \.element.id) { index, banner in
                            BannerCard(banner: banner, merchants: merchants)
                                .tag(index)
                        }
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))
                    .frame(height: 160)

                    // Custom page indicator
                    if banners.count > 1 {
                        HStack(spacing: 6) {
                            ForEach(0..<min(banners.count, 5), id: \.self) { index in
                                Circle()
                                    .fill(currentBannerIndex == index ? Color.tuckerOrange : Color.gray.opacity(0.3))
                                    .frame(width: currentBannerIndex == index ? 8 : 6, height: currentBannerIndex == index ? 8 : 6)
                                    .animation(.easeInOut(duration: 0.2), value: currentBannerIndex)
                            }
                        }
                        .padding(.bottom, 4)
                    }
                }
                .background(Color.tuckerSurface)
            } else {
                // Placeholder while loading
                Rectangle()
                    .fill(Color.tuckerSurface)
                    .frame(height: 170)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.gray.opacity(0.1))
                            .padding(.horizontal)
                    )
            }
        }
    }

    // MARK: - Quick Actions
    private var quickActions: some View {
        HStack(spacing: 0) {
            quickActionItem(icon: "tag.fill", title: "Deals", color: .red)
            quickActionItem(icon: "clock.fill", title: "Fast", color: .tuckerOrange)
            quickActionItem(icon: "percent", title: "Coupons", color: .green)
            quickActionItem(icon: "star.fill", title: "Top Rated", color: .yellow)
        }
        .padding(.vertical, 12)
        .background(Color.tuckerSurface)
    }

    private func quickActionItem(icon: String, title: String, color: Color) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            Text(title)
                .font(.caption)
                .foregroundColor(.tuckerTextPrimary)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Categories Section
    private var categoriesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Categories")
                    .font(.headline)
                Spacer()
                Text("More")
                    .font(.caption)
                    .foregroundColor(.tuckerOrange)
            }
            .padding(.horizontal)

            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 5), spacing: 16) {
                ForEach(categories) { category in
                    NavigationLink(destination: SearchView()) {
                        VStack(spacing: 6) {
                            Text(category.icon ?? "🍽️")
                                .font(.system(size: 28))
                                .frame(width: 50, height: 50)
                                .background(Color.tuckerOrange.opacity(0.1))
                                .cornerRadius(12)

                            Text(category.name)
                                .font(.caption2)
                                .foregroundColor(.tuckerTextPrimary)
                                .lineLimit(1)
                        }
                    }
                }
            }
            .padding(.horizontal)
        }
        .padding(.vertical, 12)
        .background(Color.tuckerSurface)
        .padding(.top, 8)
    }

    // MARK: - Flash Deals Section
    private var flashDealsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                HStack(spacing: 4) {
                    Image(systemName: "bolt.fill")
                        .foregroundColor(.red)
                    Text("Flash Deals")
                        .font(.headline)
                    Text("Limited Time")
                        .font(.caption)
                        .foregroundColor(.white)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.red)
                        .cornerRadius(4)
                }
                Spacer()
                Text("More >")
                    .font(.caption)
                    .foregroundColor(.tuckerOrange)
            }
            .padding(.horizontal)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(merchants.prefix(4)) { merchant in
                        NavigationLink(destination: MerchantDetailView(merchantId: merchant.id)) {
                            FlashDealCard(merchant: merchant)
                        }
                    }
                }
                .padding(.horizontal)
            }
        }
        .padding(.vertical, 12)
        .background(Color.tuckerSurface)
        .padding(.top, 8)
    }

    // MARK: - Nearby Restaurants Section
    private var nearbyRestaurantsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Nearby Restaurants")
                    .font(.headline)
                Spacer()
                HStack(spacing: 12) {
                    FilterChip(title: "Rating", isSelected: true)
                    FilterChip(title: "Distance", isSelected: false)
                    FilterChip(title: "Sales", isSelected: false)
                }
            }
            .padding(.horizontal)

            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .padding()
            } else if merchants.isEmpty {
                emptyStateView
            } else {
                LazyVStack(spacing: 0) {
                    ForEach(merchants) { merchant in
                        NavigationLink(destination: MerchantDetailView(merchantId: merchant.id)) {
                            MerchantCard(merchant: merchant)
                        }
                        Divider()
                            .padding(.leading, 100)
                    }
                }
            }
        }
        .padding(.vertical, 12)
        .background(Color.tuckerSurface)
        .padding(.top, 8)
    }

    private var emptyStateView: some View {
        VStack(spacing: 12) {
            Image(systemName: "storefront")
                .font(.system(size: 48))
                .foregroundColor(.tuckerTextSecondary)
            Text("No restaurants available")
                .foregroundColor(.tuckerTextSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }

    private func loadData() async {
        isLoading = true

        // Request location permission on first load
        if locationManager.authorizationStatus == .notDetermined {
            locationManager.requestPermission()
        } else if locationManager.authorizationStatus == .authorizedWhenInUse ||
                  locationManager.authorizationStatus == .authorizedAlways {
            locationManager.startUpdating()
        }

        // Load banners separately (don't fail everything if this fails)
        Task {
            do {
                let bannerItems = try await APIService.shared.getBanners()
                await MainActor.run {
                    banners = bannerItems.filter { $0.isActive && $0.type == "home" }
                }
            } catch {
                print("Error loading banners: \(error)")
            }
        }

        do {
            async let categoriesResult = APIService.shared.getCategories()
            async let merchantsResult = APIService.shared.getMerchants(
                latitude: locationManager.latitude,
                longitude: locationManager.longitude
            )

            let (cats, merchResponse) = try await (categoriesResult, merchantsResult)
            categories = cats
            merchants = merchResponse.items
        } catch {
            print("Error loading data: \(error)")
        }
        isLoading = false
    }
}

// MARK: - Supporting Views

struct BannerCard: View {
    let banner: BannerItem
    let merchants: [Merchant]

    var body: some View {
        NavigationLink(destination: destinationView) {
            ZStack(alignment: .bottomLeading) {
                // Background image
                AsyncImage(url: URL(string: banner.imageUrl)) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    case .failure(_):
                        Rectangle()
                            .fill(LinearGradient(
                                colors: [.tuckerOrange, .red.opacity(0.8)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ))
                    case .empty:
                        Rectangle()
                            .fill(Color.gray.opacity(0.2))
                            .overlay(ProgressView())
                    @unknown default:
                        Rectangle().fill(Color.gray.opacity(0.2))
                    }
                }
                .frame(height: 150)
                .clipped()

                // Gradient overlay
                LinearGradient(
                    colors: [.clear, .black.opacity(0.7)],
                    startPoint: .top,
                    endPoint: .bottom
                )

                // Text content
                VStack(alignment: .leading, spacing: 4) {
                    Text(banner.title)
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.white)

                    if let subtitle = banner.subtitle {
                        Text(subtitle)
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.9))
                    }
                }
                .padding()
            }
            .frame(height: 150)
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.15), radius: 5, x: 0, y: 2)
            .padding(.horizontal)
        }
        .buttonStyle(PlainButtonStyle())
    }

    @ViewBuilder
    private var destinationView: some View {
        if banner.actionType == "merchant", let merchantId = banner.actionValue {
            MerchantDetailView(merchantId: merchantId)
        } else if !merchants.isEmpty {
            // Default: navigate to a random merchant
            MerchantDetailView(merchantId: merchants[Int.random(in: 0..<merchants.count)].id)
        } else {
            SearchView()
        }
    }
}

struct FilterChip: View {
    let title: String
    let isSelected: Bool

    var body: some View {
        Text(title)
            .font(.caption)
            .foregroundColor(isSelected ? .tuckerOrange : .gray)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(isSelected ? Color.tuckerOrange.opacity(0.1) : Color.clear)
            .cornerRadius(12)
    }
}

struct FlashDealCard: View {
    let merchant: Merchant

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            AsyncImage(url: URL(string: merchant.logo ?? "")) { image in
                image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle().fill(Color.gray.opacity(0.2))
            }
            .frame(width: 120, height: 80)
            .cornerRadius(8)

            Text(merchant.name)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(.tuckerTextPrimary)
                .lineLimit(1)

            HStack(spacing: 2) {
                Text("$\(Int(merchant.minOrderAmount))")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.red)
                Text("up")
                    .font(.caption2)
                    .foregroundColor(.tuckerTextSecondary)
            }
        }
        .frame(width: 120)
    }
}

struct MerchantCard: View {
    let merchant: Merchant
    @State private var isFavorite = false

    var body: some View {
        HStack(spacing: 12) {
            // Logo
            AsyncImage(url: URL(string: merchant.logo ?? "")) { image in
                image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle().fill(Color.gray.opacity(0.2))
            }
            .frame(width: 80, height: 80)
            .cornerRadius(8)

            VStack(alignment: .leading, spacing: 6) {
                // Name and tags
                HStack {
                    Text(merchant.name)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.tuckerTextPrimary)
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

                // Rating and sales
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
                    Text("\(merchant.monthlySales)+ orders")
                        .foregroundColor(.tuckerTextSecondary)
                        .font(.caption)
                }

                // Delivery info
                HStack(spacing: 8) {
                    HStack(spacing: 2) {
                        Image(systemName: "clock")
                            .font(.caption2)
                        Text(merchant.deliveryTime ?? "30-45 min")
                            .font(.caption)
                    }
                    .foregroundColor(.tuckerTextSecondary)

                    Text("Delivery $\(Int(merchant.deliveryFee))")
                        .font(.caption)
                        .foregroundColor(.tuckerTextSecondary)

                    Text("Min $\(Int(merchant.minOrderAmount))")
                        .font(.caption)
                        .foregroundColor(.tuckerTextSecondary)
                }

                // Tags
                HStack(spacing: 4) {
                    DealTag(text: "New Customer -$5", color: .red)
                    DealTag(text: "Free Delivery", color: .tuckerOrange)
                }
            }

            Spacer()

            // Favorite button
            Button {
                toggleFavorite()
            } label: {
                Image(systemName: isFavorite ? "heart.fill" : "heart")
                    .font(.title3)
                    .foregroundColor(isFavorite ? .red : .gray)
            }
            .buttonStyle(PlainButtonStyle())
        }
        .padding()
        .task {
            await checkFavoriteStatus()
        }
    }

    private func checkFavoriteStatus() async {
        do {
            isFavorite = try await APIService.shared.isFavorite(merchantId: merchant.id)
        } catch {
            // Silently fail - user might not be logged in
        }
    }

    private func toggleFavorite() {
        let wasFavorite = isFavorite
        isFavorite.toggle()

        Task {
            do {
                if wasFavorite {
                    try await APIService.shared.removeFavorite(merchantId: merchant.id)
                } else {
                    _ = try await APIService.shared.addFavorite(merchantId: merchant.id)
                }
            } catch {
                await MainActor.run {
                    isFavorite = wasFavorite
                }
            }
        }
    }
}

struct DealTag: View {
    let text: String
    let color: Color

    var body: some View {
        Text(text)
            .font(.caption2)
            .foregroundColor(color)
            .padding(.horizontal, 4)
            .padding(.vertical, 2)
            .background(color.opacity(0.1))
            .cornerRadius(2)
    }
}

#Preview {
    HomeView()
}
