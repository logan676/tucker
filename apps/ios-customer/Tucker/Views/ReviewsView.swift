import SwiftUI

struct ReviewsView: View {
    let merchantId: String

    @State private var reviews: [Review] = []
    @State private var stats: ReviewStats?
    @State private var isLoading = true
    @State private var selectedFilter: ReviewFilter = .all
    @State private var currentPage = 1
    @State private var hasMorePages = true

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Stats Header
                if let stats = stats {
                    statsHeader(stats: stats)
                }

                // Filter Tabs
                filterTabs

                // Reviews List
                if isLoading && reviews.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 40)
                } else if reviews.isEmpty {
                    emptyState
                } else {
                    reviewsList
                }
            }
        }
        .background(Color(.systemGray6))
        .navigationTitle("Reviews")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadData()
        }
    }

    // MARK: - Stats Header
    private func statsHeader(stats: ReviewStats) -> some View {
        VStack(spacing: 16) {
            HStack(spacing: 24) {
                // Overall Rating
                VStack(spacing: 4) {
                    Text(String(format: "%.1f", stats.averageRating))
                        .font(.system(size: 48, weight: .bold))
                        .foregroundColor(.tuckerOrange)

                    HStack(spacing: 2) {
                        ForEach(1...5, id: \.self) { index in
                            Image(systemName: Double(index) <= stats.averageRating ? "star.fill" : (Double(index) - 0.5 <= stats.averageRating ? "star.leadinghalf.filled" : "star"))
                                .foregroundColor(.tuckerOrange)
                                .font(.caption)
                        }
                    }

                    Text("\(stats.totalReviews) reviews")
                        .font(.caption)
                        .foregroundColor(.gray)
                }

                Divider()
                    .frame(height: 80)

                // Rating Distribution
                VStack(alignment: .leading, spacing: 4) {
                    ForEach((1...5).reversed(), id: \.self) { rating in
                        HStack(spacing: 8) {
                            Text("\(rating)")
                                .font(.caption)
                                .foregroundColor(.gray)
                                .frame(width: 12)

                            Image(systemName: "star.fill")
                                .foregroundColor(.tuckerOrange)
                                .font(.caption2)

                            GeometryReader { geometry in
                                ZStack(alignment: .leading) {
                                    Rectangle()
                                        .fill(Color.gray.opacity(0.2))
                                        .frame(height: 6)
                                        .cornerRadius(3)

                                    let count = stats.ratingDistribution["\(rating)"] ?? 0
                                    let percentage = stats.totalReviews > 0 ? Double(count) / Double(stats.totalReviews) : 0
                                    Rectangle()
                                        .fill(Color.tuckerOrange)
                                        .frame(width: geometry.size.width * percentage, height: 6)
                                        .cornerRadius(3)
                                }
                            }
                            .frame(height: 6)

                            Text("\(stats.ratingDistribution["\(rating)"] ?? 0)")
                                .font(.caption2)
                                .foregroundColor(.gray)
                                .frame(width: 24, alignment: .trailing)
                        }
                    }
                }
                .frame(maxWidth: .infinity)
            }
            .padding()

            // Category Ratings
            HStack(spacing: 0) {
                CategoryRating(title: "Taste", rating: stats.tasteAverage, icon: "fork.knife")
                CategoryRating(title: "Packaging", rating: stats.packagingAverage, icon: "shippingbox")
                CategoryRating(title: "Delivery", rating: stats.deliveryAverage, icon: "bicycle")
            }
            .padding(.horizontal)
            .padding(.bottom)
        }
        .background(Color.white)
    }

    // MARK: - Filter Tabs
    private var filterTabs: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(ReviewFilter.allCases, id: \.self) { filter in
                    Button {
                        selectedFilter = filter
                        Task {
                            currentPage = 1
                            reviews = []
                            await loadReviews()
                        }
                    } label: {
                        Text(filter.title)
                            .font(.subheadline)
                            .fontWeight(selectedFilter == filter ? .semibold : .regular)
                            .foregroundColor(selectedFilter == filter ? .white : .primary)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(selectedFilter == filter ? Color.tuckerOrange : Color(.systemGray6))
                            .cornerRadius(18)
                    }
                }
            }
            .padding(.horizontal)
        }
        .padding(.vertical, 12)
        .background(Color.white)
    }

    // MARK: - Empty State
    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "star.bubble")
                .font(.system(size: 48))
                .foregroundColor(.gray)
            Text("No reviews yet")
                .font(.headline)
                .foregroundColor(.gray)
            Text("Be the first to leave a review!")
                .font(.caption)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }

    // MARK: - Reviews List
    private var reviewsList: some View {
        LazyVStack(spacing: 0) {
            ForEach(reviews) { review in
                ReviewCard(review: review)
                    .onAppear {
                        if review.id == reviews.last?.id && hasMorePages {
                            Task { await loadMoreReviews() }
                        }
                    }
                Divider()
            }
        }
        .background(Color.white)
    }

    // MARK: - Data Loading
    private func loadData() async {
        isLoading = true
        async let statsTask: () = loadStats()
        async let reviewsTask: () = loadReviews()
        _ = await (statsTask, reviewsTask)
        isLoading = false
    }

    private func loadStats() async {
        do {
            stats = try await APIService.shared.getMerchantReviewStats(merchantId: merchantId)
        } catch {
            print("Error loading stats: \(error)")
        }
    }

    private func loadReviews() async {
        do {
            let response = try await APIService.shared.getMerchantReviews(
                merchantId: merchantId,
                page: currentPage
            )
            reviews = response.items
            hasMorePages = response.pagination.page < response.pagination.totalPages
        } catch {
            print("Error loading reviews: \(error)")
        }
    }

    private func loadMoreReviews() async {
        currentPage += 1
        do {
            let response = try await APIService.shared.getMerchantReviews(
                merchantId: merchantId,
                page: currentPage
            )
            reviews.append(contentsOf: response.items)
            hasMorePages = response.pagination.page < response.pagination.totalPages
        } catch {
            print("Error loading more reviews: \(error)")
        }
    }
}

// MARK: - Review Filter
enum ReviewFilter: CaseIterable {
    case all, withPhotos, highRating, recent

    var title: String {
        switch self {
        case .all: return "All"
        case .withPhotos: return "With Photos"
        case .highRating: return "High Rating"
        case .recent: return "Recent"
        }
    }
}

// MARK: - Category Rating
struct CategoryRating: View {
    let title: String
    let rating: Double
    let icon: String

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(.tuckerOrange)

            Text(String(format: "%.1f", rating))
                .font(.headline)
                .fontWeight(.bold)

            Text(title)
                .font(.caption2)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Review Card
struct ReviewCard: View {
    let review: Review
    @State private var isLiked = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // User Info
            HStack(spacing: 12) {
                AsyncImage(url: URL(string: review.user?.avatar ?? "")) { image in
                    image.resizable().aspectRatio(contentMode: .fill)
                } placeholder: {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.gray)
                }
                .frame(width: 40, height: 40)
                .clipShape(Circle())

                VStack(alignment: .leading, spacing: 2) {
                    Text(review.isAnonymous ? "Anonymous" : (review.user?.name ?? "User"))
                        .font(.subheadline)
                        .fontWeight(.medium)

                    HStack(spacing: 2) {
                        ForEach(1...5, id: \.self) { index in
                            Image(systemName: Double(index) <= review.rating ? "star.fill" : "star")
                                .foregroundColor(.tuckerOrange)
                                .font(.caption2)
                        }
                    }
                }

                Spacer()

                Text(formatDate(review.createdAt))
                    .font(.caption)
                    .foregroundColor(.gray)
            }

            // Content
            if let content = review.content, !content.isEmpty {
                Text(content)
                    .font(.subheadline)
                    .foregroundColor(.primary)
            }

            // Images
            if let images = review.images, !images.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(images, id: \.self) { imageUrl in
                            AsyncImage(url: URL(string: imageUrl)) { image in
                                image.resizable().aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Rectangle().fill(Color.gray.opacity(0.2))
                            }
                            .frame(width: 80, height: 80)
                            .cornerRadius(8)
                        }
                    }
                }
            }

            // Ratings Detail
            HStack(spacing: 16) {
                RatingPill(title: "Taste", rating: review.tasteRating)
                RatingPill(title: "Packaging", rating: review.packagingRating)
                RatingPill(title: "Delivery", rating: review.deliveryRating)
            }

            // Merchant Reply
            if let reply = review.merchantReply {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 4) {
                        Image(systemName: "storefront")
                            .font(.caption2)
                        Text("Merchant Reply")
                            .font(.caption)
                            .fontWeight(.medium)
                    }
                    .foregroundColor(.tuckerOrange)

                    Text(reply)
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(.systemGray6))
                .cornerRadius(8)
            }

            // Actions
            HStack {
                Button {
                    isLiked.toggle()
                    Task {
                        try? await APIService.shared.likeReview(reviewId: review.id)
                    }
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: isLiked ? "hand.thumbsup.fill" : "hand.thumbsup")
                        Text("\(review.likes + (isLiked ? 1 : 0))")
                    }
                    .font(.caption)
                    .foregroundColor(isLiked ? .tuckerOrange : .gray)
                }

                Spacer()
            }
        }
        .padding()
    }

    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "d MMM yyyy"
            return displayFormatter.string(from: date)
        }
        return dateString
    }
}

// MARK: - Rating Pill
struct RatingPill: View {
    let title: String
    let rating: Int

    var body: some View {
        HStack(spacing: 4) {
            Text(title)
                .foregroundColor(.gray)
            Text("\(rating)")
                .foregroundColor(.primary)
                .fontWeight(.medium)
        }
        .font(.caption2)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}

#Preview {
    NavigationStack {
        ReviewsView(merchantId: "1")
    }
}
