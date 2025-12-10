# Tucker iOS Customer App

> SwiftUI-based food delivery customer application for iOS 16+

## Overview

The iOS customer app provides a native mobile experience for ordering food from local restaurants. Built with SwiftUI and follows MVVM architecture patterns.

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| UI Framework | SwiftUI | iOS 16+ |
| Language | Swift | 5.9+ |
| Architecture | MVVM | - |
| Networking | URLSession | async/await |
| State Management | @Published, @State | - |
| Image Loading | AsyncImage | Built-in |

## Project Structure

```
apps/ios-customer/Tucker/
├── TuckerApp.swift              # App entry point
├── ContentView.swift            # Main tab navigation
├── Views/
│   ├── HomeView.swift           # Home feed with merchants
│   ├── SearchView.swift         # Search functionality
│   ├── OrdersView.swift         # Order history & tracking
│   ├── OrderDetailView.swift    # Individual order details
│   ├── ProfileView.swift        # User profile & settings
│   ├── EditProfileView.swift    # Profile editing
│   ├── MerchantDetailView.swift # Restaurant menu view
│   ├── ProductOptionsSheet.swift# Item customization
│   ├── CheckoutView.swift       # Checkout flow
│   ├── PaymentView.swift        # Payment selection
│   ├── ReviewsView.swift        # Merchant reviews
│   ├── AddressListView.swift    # Address management
│   ├── AddressFormView.swift    # Add/edit address
│   └── LoginView.swift          # Authentication
├── Models/
│   └── Models.swift             # Data models (Codable)
├── Services/
│   └── APIService.swift         # API client singleton
├── Managers/
│   ├── AuthManager.swift        # Authentication state
│   ├── CartManager.swift        # Shopping cart state
│   └── LocationManager.swift    # Location services
└── Extensions/
    └── Color+Tucker.swift       # Brand colors
```

## Key Features

### Implemented
- [x] Phone number authentication with SMS OTP
- [x] Home feed with categories, banners, merchants
- [x] Merchant detail with menu categories
- [x] Product customization with options
- [x] Shopping cart with option variants
- [x] Checkout with address selection
- [x] Payment flow (mock payment)
- [x] Order history with status tabs
- [x] Order detail view
- [x] User profile management
- [x] Address CRUD operations
- [x] Favorites (bookmark merchants)
- [x] Merchant reviews display
- [x] Location-based merchant sorting
- [x] Pull-to-refresh

### Planned
- [ ] Order tracking with map
- [ ] Push notifications
- [ ] Pickup mode
- [ ] In-app messaging
- [ ] Re-order functionality

## Data Models

### Core Models
```swift
struct User: Codable, Identifiable
struct Merchant: Codable, Identifiable
struct Product: Codable, Identifiable
struct ProductOption: Codable, Identifiable
struct Order: Codable, Identifiable
struct Address: Codable, Identifiable
struct Review: Codable, Identifiable
struct Coupon: Codable, Identifiable
```

### Cart Model
```swift
struct CartItem: Identifiable {
    let product: Product
    var quantity: Int
    var selectedOptions: [String: String]
    var optionPrice: Double
}
```

## API Integration

The `APIService` singleton handles all API communication:

```swift
class APIService {
    static let shared = APIService()
    private let baseURL = "http://127.0.0.1:3000/api/v1"

    // Auth
    func sendSmsCode(phone: String) async throws
    func login(phone: String, code: String) async throws -> AuthResponse

    // Merchants
    func getMerchants(page: Int, latitude: Double?, longitude: Double?) async throws -> PaginatedResponse<Merchant>
    func getMerchant(id: String) async throws -> Merchant
    func getMerchantMenu(merchantId: String) async throws -> MenuResponse

    // Orders
    func createOrder(...) async throws -> CreateOrderResponse
    func getOrders(page: Int) async throws -> PaginatedResponse<Order>

    // User
    func updateUserProfile(name: String?, avatar: String?) async throws -> User
    func getAddresses() async throws -> [Address]

    // Favorites
    func addFavorite(merchantId: String) async throws -> Favorite
    func removeFavorite(merchantId: String) async throws
    func isFavorite(merchantId: String) async throws -> Bool

    // Reviews
    func getMerchantReviews(merchantId: String) async throws -> ReviewsResponse
    func getMerchantReviewStats(merchantId: String) async throws -> ReviewStats
}
```

## State Management

### AuthManager
Manages user authentication state globally:
```swift
class AuthManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var token: String?
}
```

### CartManager
Manages shopping cart with option support:
```swift
class CartManager: ObservableObject {
    @Published var items: [CartItem] = []
    @Published var merchantId: String?

    func addItemWithOptions(_ product: Product, quantity: Int, options: [String: String], optionPrice: Double)
    func removeItem(_ product: Product)
    var totalPrice: Double { ... }
    var totalItems: Int { ... }
}
```

## Brand Colors

Defined in `Color+Tucker.swift`:
```swift
extension Color {
    static let tuckerOrange = Color(hex: "D97B28")
    static let tuckerBackground = Color(hex: "F9F6F0")
    static let tuckerSurface = Color.white
    static let tuckerTextPrimary = Color(hex: "2C2825")
    static let tuckerTextSecondary = Color(hex: "75716C")
}
```

## Building & Running

### Requirements
- Xcode 15+
- iOS 16+ Simulator or Device
- Backend API running at localhost:3000

### Steps
1. Open `apps/ios-customer/Tucker.xcodeproj` in Xcode
2. Select target device/simulator
3. Build and Run (Cmd + R)

### Configuration
Update `APIService.swift` baseURL for different environments:
```swift
private let baseURL = "http://127.0.0.1:3000/api/v1" // Development
// private let baseURL = "https://api.tucker.com/v1" // Production
```

## Testing

```bash
# Run unit tests
xcodebuild test -scheme Tucker -destination 'platform=iOS Simulator,name=iPhone 15'
```

## Screenshots

| Home | Merchant | Cart | Orders |
|------|----------|------|--------|
| Home feed with categories and merchants | Restaurant menu with options | Shopping cart | Order history |
