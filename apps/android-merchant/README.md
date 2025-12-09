# Tucker Android Merchant

Android merchant application for store management and order processing.

## Tech Stack

- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **Min SDK**: 26 (Android 8.0)
- **Target SDK**: 34 (Android 14)
- **Architecture**: MVVM + Clean Architecture
- **Dependency Injection**: Hilt
- **Testing**: JUnit5 + Mockk + Compose Testing

## Project Structure

```
app/src/main/
├── java/com/tucker/merchant/
│   ├── TuckerMerchantApp.kt
│   ├── ui/                     # UI layer
│   │   ├── dashboard/          # Dashboard
│   │   │   ├── DashboardScreen.kt
│   │   │   ├── DashboardViewModel.kt
│   │   │   └── components/
│   │   │       ├── StatisticsCard.kt
│   │   │       └── TrendChart.kt
│   │   ├── orders/             # Order management
│   │   │   ├── OrderListScreen.kt
│   │   │   ├── OrderDetailScreen.kt
│   │   │   ├── OrdersViewModel.kt
│   │   │   └── components/
│   │   │       ├── OrderCard.kt
│   │   │       └── OrderActionButtons.kt
│   │   ├── products/           # Product management
│   │   │   ├── ProductListScreen.kt
│   │   │   ├── ProductEditScreen.kt
│   │   │   ├── ProductsViewModel.kt
│   │   │   └── components/
│   │   │       └── ProductItem.kt
│   │   ├── store/              # Store management
│   │   │   ├── StoreInfoScreen.kt
│   │   │   ├── StoreViewModel.kt
│   │   │   └── components/
│   │   │       ├── BusinessHoursEditor.kt
│   │   │       └── DeliverySettings.kt
│   │   └── settings/           # Settings
│   │       ├── SettingsScreen.kt
│   │       └── SettingsViewModel.kt
│   ├── data/                   # Data layer
│   │   ├── api/
│   │   ├── repository/
│   │   └── local/
│   ├── domain/                 # Domain layer
│   │   ├── model/
│   │   └── usecase/
│   ├── di/                     # Dependency injection
│   └── utils/                  # Utilities
└── res/

app/src/test/                   # Unit tests
├── java/com/tucker/merchant/
│   ├── ui/
│   │   ├── dashboard/
│   │   │   └── DashboardViewModelTest.kt
│   │   └── orders/
│   │       └── OrdersViewModelTest.kt
│   └── domain/
│       └── usecase/

app/src/androidTest/            # Instrumented tests
├── java/com/tucker/merchant/
│   └── ui/
│       └── orders/
│           └── OrderProcessingTest.kt
```

## Feature Modules

| Module | Features |
|--------|----------|
| Dashboard | Today's data, sales statistics, trend charts |
| Orders | New order alerts, accept/reject, order list |
| Products | Product management, availability, category management |
| Store | Store info, business hours, delivery settings |
| Settings | Notification settings, account management |

## Development

```bash
# Build Debug APK
./gradlew assembleDebug

# Build Release APK
./gradlew assembleRelease
```

## Testing

### Unit Tests

```bash
# Run all unit tests
./gradlew test

# Run with coverage
./gradlew testDebugUnitTestCoverage
```

### Instrumented Tests

```bash
# Run all instrumented tests
./gradlew connectedAndroidTest
```

### Test Coverage Requirements

- Minimum coverage: 70%
- All ViewModels must have unit tests
- Order processing flows must have instrumented tests
