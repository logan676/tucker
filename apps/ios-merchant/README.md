# Tucker iOS Merchant

iOS merchant application for store management and order processing.

## Tech Stack

- **Language**: Swift 5.9+
- **UI Framework**: SwiftUI
- **Minimum iOS**: iOS 16.0
- **Architecture**: MVVM + Clean Architecture
- **Dependency Management**: Swift Package Manager
- **Testing**: XCTest + XCUITest

## Project Structure

```
TuckerMerchant/
├── App/                        # App entry point
│   ├── TuckerMerchantApp.swift
│   └── AppDelegate.swift
├── Features/                   # Feature modules
│   ├── Dashboard/              # Dashboard
│   │   ├── Views/
│   │   │   ├── DashboardView.swift
│   │   │   ├── StatisticsView.swift
│   │   │   └── TodaySummaryView.swift
│   │   ├── ViewModels/
│   │   │   └── DashboardViewModel.swift
│   │   └── Tests/
│   │       └── DashboardViewModelTests.swift
│   ├── Orders/                 # Order management
│   │   ├── Views/
│   │   │   ├── OrderListView.swift
│   │   │   ├── OrderDetailView.swift
│   │   │   └── OrderActionView.swift
│   │   ├── ViewModels/
│   │   │   └── OrdersViewModel.swift
│   │   └── Tests/
│   ├── Products/               # Product management
│   │   ├── Views/
│   │   │   ├── ProductListView.swift
│   │   │   ├── ProductEditView.swift
│   │   │   └── CategoryManageView.swift
│   │   ├── ViewModels/
│   │   │   └── ProductsViewModel.swift
│   │   └── Tests/
│   ├── Store/                  # Store management
│   │   ├── Views/
│   │   │   ├── StoreInfoView.swift
│   │   │   ├── BusinessHoursView.swift
│   │   │   └── DeliverySettingsView.swift
│   │   ├── ViewModels/
│   │   │   └── StoreViewModel.swift
│   │   └── Tests/
│   └── Settings/               # Settings
│       ├── Views/
│       │   ├── SettingsView.swift
│       │   ├── NotificationSettingsView.swift
│       │   └── AccountView.swift
│       ├── ViewModels/
│       │   └── SettingsViewModel.swift
│       └── Tests/
├── Core/                       # Core modules
│   ├── Network/
│   │   └── Tests/
│   ├── Storage/
│   │   └── Tests/
│   ├── Utils/
│   └── Extensions/
├── Models/                     # Data models
│   ├── MerchantInfo.swift
│   ├── Order.swift
│   ├── Product.swift
│   └── Statistics.swift
├── Services/                   # Business services
│   ├── AuthService.swift
│   ├── OrderService.swift
│   ├── ProductService.swift
│   ├── StoreService.swift
│   └── Tests/
├── Resources/
│   ├── Assets/
│   └── Fonts/
├── TuckerMerchantTests/        # Unit tests
└── TuckerMerchantUITests/      # UI tests
```

## Feature Modules

| Module | Features |
|--------|----------|
| Dashboard | Today's data, sales statistics, trend charts |
| Orders | New order alerts, accept/reject, order list, order details |
| Products | Product list, add/edit, availability, category management |
| Store | Store info, business hours, delivery settings |
| Settings | Notification settings, account management, help center |

## Development

```bash
# Open project
open TuckerMerchant.xcodeproj
```

## Testing

### Unit Tests

```bash
# Run via Xcode: Cmd+U
```

### UI Tests

```bash
# Select TuckerMerchantUITests scheme
# Run via Xcode: Cmd+U
```

### Test Coverage Requirements

- Minimum coverage: 70%
- All ViewModels must have unit tests
- Order processing flows must have UI tests
