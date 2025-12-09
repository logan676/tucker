# Tucker iOS Customer

iOS customer application for browsing merchants, ordering food, and managing orders.

## Tech Stack

- **Language**: Swift 5.9+
- **UI Framework**: SwiftUI
- **Minimum iOS**: iOS 16.0
- **Architecture**: MVVM + Clean Architecture
- **Dependency Management**: Swift Package Manager
- **Networking**: URLSession + Async/Await
- **Storage**: SwiftData / UserDefaults
- **Testing**: XCTest + XCUITest

## Project Structure

```
TuckerCustomer/
├── App/                        # App entry point
│   ├── TuckerCustomerApp.swift
│   ├── AppDelegate.swift
│   └── SceneDelegate.swift
├── Features/                   # Feature modules
│   ├── Home/                   # Home
│   │   ├── Views/
│   │   │   ├── HomeView.swift
│   │   │   ├── CategoryGridView.swift
│   │   │   ├── BannerView.swift
│   │   │   └── MerchantCardView.swift
│   │   ├── ViewModels/
│   │   │   └── HomeViewModel.swift
│   │   └── Tests/
│   │       ├── HomeViewModelTests.swift
│   │       └── HomeViewTests.swift
│   ├── Search/                 # Search
│   │   ├── Views/
│   │   │   ├── SearchView.swift
│   │   │   ├── FilterView.swift
│   │   │   └── SearchResultView.swift
│   │   ├── ViewModels/
│   │   │   └── SearchViewModel.swift
│   │   └── Tests/
│   ├── Merchant/               # Merchant detail
│   │   ├── Views/
│   │   │   ├── MerchantDetailView.swift
│   │   │   ├── MenuListView.swift
│   │   │   ├── ProductItemView.swift
│   │   │   └── ReviewListView.swift
│   │   ├── ViewModels/
│   │   │   └── MerchantViewModel.swift
│   │   └── Tests/
│   ├── Cart/                   # Cart
│   │   ├── Views/
│   │   │   ├── CartView.swift
│   │   │   └── CartItemView.swift
│   │   ├── ViewModels/
│   │   │   └── CartViewModel.swift
│   │   └── Tests/
│   ├── Order/                  # Orders
│   │   ├── Views/
│   │   │   ├── OrderListView.swift
│   │   │   ├── OrderDetailView.swift
│   │   │   └── OrderConfirmView.swift
│   │   ├── ViewModels/
│   │   │   └── OrderViewModel.swift
│   │   └── Tests/
│   ├── User/                   # User profile
│   │   ├── Views/
│   │   │   ├── ProfileView.swift
│   │   │   └── SettingsView.swift
│   │   ├── ViewModels/
│   │   │   └── UserViewModel.swift
│   │   └── Tests/
│   └── Address/                # Address management
│       ├── Views/
│       │   ├── AddressListView.swift
│       │   └── AddressEditView.swift
│       ├── ViewModels/
│       │   └── AddressViewModel.swift
│       └── Tests/
├── Core/                       # Core modules
│   ├── Network/                # Network layer
│   │   ├── APIClient.swift
│   │   ├── APIEndpoint.swift
│   │   ├── APIError.swift
│   │   ├── RequestInterceptor.swift
│   │   └── Tests/
│   │       ├── APIClientTests.swift
│   │       └── MockURLProtocol.swift
│   ├── Storage/                # Storage layer
│   │   ├── KeychainManager.swift
│   │   ├── UserDefaultsManager.swift
│   │   ├── CacheManager.swift
│   │   └── Tests/
│   ├── Utils/                  # Utilities
│   │   ├── Logger.swift
│   │   ├── Validator.swift
│   │   └── DateFormatter+Ext.swift
│   └── Extensions/             # Extensions
│       ├── View+Ext.swift
│       ├── Color+Ext.swift
│       └── String+Ext.swift
├── Models/                     # Data models
│   ├── User.swift
│   ├── Merchant.swift
│   ├── Product.swift
│   ├── Order.swift
│   ├── CartItem.swift
│   └── Address.swift
├── Services/                   # Business services
│   ├── AuthService.swift
│   ├── MerchantService.swift
│   ├── OrderService.swift
│   ├── CartService.swift
│   ├── LocationService.swift
│   └── Tests/
│       ├── AuthServiceTests.swift
│       └── MockServices.swift
├── Resources/                  # Resource files
│   ├── Assets/
│   │   └── Assets.xcassets
│   ├── Fonts/
│   └── Localizable.strings
└── TuckerCustomerTests/        # Test target
    ├── Mocks/
    │   ├── MockAPIClient.swift
    │   └── MockServices.swift
    └── Helpers/
        └── TestHelpers.swift

TuckerCustomerUITests/          # UI Test target
├── HomeUITests.swift
├── OrderFlowUITests.swift
└── TestHelpers/
    └── XCUIApplication+Ext.swift
```

## Feature Modules

| Module | Features |
|--------|----------|
| Home | Home recommendations, category browsing, banner |
| Search | Search merchants/products, filtering, sorting |
| Merchant | Merchant details, menu, reviews |
| Cart | Cart management, recommendations |
| Order | Ordering, order list, order details, order tracking |
| User | Profile, settings |
| Address | Delivery address management |

## Development

```bash
# Open project
open TuckerCustomer.xcodeproj

# Dependencies are managed via SPM and will be resolved automatically
# Select Product > Build or Cmd+B
```

## Testing

### Unit Tests (XCTest)

```bash
# Run unit tests via Xcode
# Cmd+U or Product > Test

# Run specific test
# Click the diamond icon next to the test method
```

### UI Tests (XCUITest)

```bash
# Run UI tests via Xcode
# Select TuckerCustomerUITests scheme
# Cmd+U or Product > Test
```

### Test Coverage Requirements

- Minimum coverage: 70%
- All ViewModels must have unit tests
- All Services must have unit tests
- Critical user flows must have UI tests

### Test Examples

**ViewModel Test:**
```swift
// Features/Home/Tests/HomeViewModelTests.swift
import XCTest
@testable import TuckerCustomer

final class HomeViewModelTests: XCTestCase {
    var sut: HomeViewModel!
    var mockMerchantService: MockMerchantService!

    override func setUp() {
        super.setUp()
        mockMerchantService = MockMerchantService()
        sut = HomeViewModel(merchantService: mockMerchantService)
    }

    override func tearDown() {
        sut = nil
        mockMerchantService = nil
        super.tearDown()
    }

    func testLoadMerchants_Success() async {
        // Given
        mockMerchantService.merchants = [.mock()]

        // When
        await sut.loadMerchants()

        // Then
        XCTAssertEqual(sut.merchants.count, 1)
        XCTAssertFalse(sut.isLoading)
        XCTAssertNil(sut.error)
    }

    func testLoadMerchants_Failure() async {
        // Given
        mockMerchantService.error = APIError.networkError

        // When
        await sut.loadMerchants()

        // Then
        XCTAssertTrue(sut.merchants.isEmpty)
        XCTAssertNotNil(sut.error)
    }
}
```

**UI Test:**
```swift
// TuckerCustomerUITests/OrderFlowUITests.swift
import XCTest

final class OrderFlowUITests: XCTestCase {
    var app: XCUIApplication!

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments = ["UI_TESTING"]
        app.launch()
    }

    func testCompleteOrderFlow() {
        // Select merchant
        app.collectionViews.cells["merchant_card"].firstMatch.tap()

        // Add item to cart
        app.buttons["add_to_cart"].firstMatch.tap()

        // Go to cart
        app.tabBars.buttons["Cart"].tap()

        // Checkout
        app.buttons["checkout"].tap()

        // Confirm order
        app.buttons["confirm_order"].tap()

        // Verify success
        XCTAssertTrue(app.staticTexts["Order Placed Successfully"].exists)
    }
}
```

## Dependencies

- **Kingfisher**: Image loading and caching
- **SwiftLint**: Code style checking

## Code Style

Run SwiftLint before committing:
```bash
swiftlint
```
