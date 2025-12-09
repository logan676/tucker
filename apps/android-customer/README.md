# Tucker Android Customer

Android customer application for browsing merchants, ordering food, and managing orders.

## Tech Stack

- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **Min SDK**: 26 (Android 8.0)
- **Target SDK**: 34 (Android 14)
- **Architecture**: MVVM + Clean Architecture
- **Dependency Injection**: Hilt
- **Networking**: Retrofit + OkHttp
- **Async**: Kotlin Coroutines + Flow
- **Testing**: JUnit5 + Mockk + Compose Testing + Espresso

## Project Structure

```
app/src/main/
├── java/com/tucker/customer/
│   ├── TuckerApplication.kt    # Application class
│   ├── ui/                     # UI layer
│   │   ├── home/               # Home
│   │   │   ├── HomeScreen.kt
│   │   │   ├── HomeViewModel.kt
│   │   │   └── components/
│   │   │       ├── CategoryGrid.kt
│   │   │       ├── BannerCarousel.kt
│   │   │       └── MerchantCard.kt
│   │   ├── search/             # Search
│   │   │   ├── SearchScreen.kt
│   │   │   ├── SearchViewModel.kt
│   │   │   └── components/
│   │   │       ├── FilterSheet.kt
│   │   │       └── SearchResultItem.kt
│   │   ├── merchant/           # Merchant detail
│   │   │   ├── MerchantScreen.kt
│   │   │   ├── MerchantViewModel.kt
│   │   │   └── components/
│   │   │       ├── MerchantHeader.kt
│   │   │       ├── MenuList.kt
│   │   │       └── ReviewSection.kt
│   │   ├── cart/               # Cart
│   │   │   ├── CartScreen.kt
│   │   │   ├── CartViewModel.kt
│   │   │   └── components/
│   │   │       └── CartItem.kt
│   │   ├── order/              # Orders
│   │   │   ├── OrderListScreen.kt
│   │   │   ├── OrderDetailScreen.kt
│   │   │   ├── OrderConfirmScreen.kt
│   │   │   └── OrderViewModel.kt
│   │   ├── user/               # User profile
│   │   │   ├── ProfileScreen.kt
│   │   │   ├── UserViewModel.kt
│   │   │   └── components/
│   │   └── address/            # Address management
│   │       ├── AddressListScreen.kt
│   │       ├── AddressEditScreen.kt
│   │       └── AddressViewModel.kt
│   ├── data/                   # Data layer
│   │   ├── api/                # API interfaces
│   │   │   ├── ApiService.kt
│   │   │   ├── AuthApi.kt
│   │   │   ├── MerchantApi.kt
│   │   │   └── OrderApi.kt
│   │   ├── repository/         # Repositories
│   │   │   ├── AuthRepository.kt
│   │   │   ├── MerchantRepository.kt
│   │   │   ├── OrderRepository.kt
│   │   │   └── CartRepository.kt
│   │   └── local/              # Local storage
│   │       ├── AppDatabase.kt
│   │       ├── dao/
│   │       └── PreferencesManager.kt
│   ├── domain/                 # Domain layer
│   │   ├── model/              # Domain models
│   │   │   ├── User.kt
│   │   │   ├── Merchant.kt
│   │   │   ├── Product.kt
│   │   │   ├── Order.kt
│   │   │   └── CartItem.kt
│   │   └── usecase/            # Use cases
│   │       ├── GetMerchantsUseCase.kt
│   │       ├── PlaceOrderUseCase.kt
│   │       └── SearchUseCase.kt
│   ├── di/                     # Dependency injection
│   │   ├── AppModule.kt
│   │   ├── NetworkModule.kt
│   │   └── DatabaseModule.kt
│   └── utils/                  # Utilities
│       ├── Extensions.kt
│       ├── Constants.kt
│       └── LocationUtils.kt
└── res/
    ├── layout/
    ├── drawable/
    ├── values/
    │   ├── strings.xml
    │   ├── colors.xml
    │   └── themes.xml
    └── mipmap/

app/src/test/                   # Unit tests
├── java/com/tucker/customer/
│   ├── ui/
│   │   ├── home/
│   │   │   └── HomeViewModelTest.kt
│   │   ├── cart/
│   │   │   └── CartViewModelTest.kt
│   │   └── order/
│   │       └── OrderViewModelTest.kt
│   ├── data/
│   │   └── repository/
│   │       ├── MerchantRepositoryTest.kt
│   │       └── OrderRepositoryTest.kt
│   ├── domain/
│   │   └── usecase/
│   │       └── PlaceOrderUseCaseTest.kt
│   └── testutil/
│       ├── TestDispatcherRule.kt
│       └── FakeRepository.kt

app/src/androidTest/            # Instrumented tests
├── java/com/tucker/customer/
│   ├── ui/
│   │   ├── home/
│   │   │   └── HomeScreenTest.kt
│   │   └── order/
│   │       └── OrderFlowTest.kt
│   └── testutil/
│       └── ComposeTestUtils.kt
```

## Feature Modules

| Module | Features |
|--------|----------|
| Home | Home recommendations, category browsing, banner |
| Search | Search merchants/products, filtering, sorting |
| Merchant | Merchant details, menu, reviews |
| Cart | Cart management |
| Order | Ordering, order list, order details |
| User | Profile, settings |
| Address | Delivery address management |

## Dependencies

```kotlin
// Jetpack Compose
implementation("androidx.compose.ui:ui")
implementation("androidx.compose.material3:material3")
implementation("androidx.navigation:navigation-compose")

// Hilt
implementation("com.google.dagger:hilt-android")
kapt("com.google.dagger:hilt-compiler")

// Retrofit
implementation("com.squareup.retrofit2:retrofit")
implementation("com.squareup.retrofit2:converter-gson")

// Room
implementation("androidx.room:room-runtime")
implementation("androidx.room:room-ktx")

// Coil (image loading)
implementation("io.coil-kt:coil-compose")

// Coroutines
implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android")

// Testing
testImplementation("junit:junit:4.13.2")
testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
testImplementation("io.mockk:mockk:1.13.8")
testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test")
testImplementation("app.cash.turbine:turbine:1.0.0")

androidTestImplementation("androidx.compose.ui:ui-test-junit4")
androidTestImplementation("androidx.test.espresso:espresso-core")
androidTestImplementation("com.google.dagger:hilt-android-testing")
```

## Development

```bash
# Build Debug APK
./gradlew assembleDebug

# Build Release APK
./gradlew assembleRelease

# Install on device
./gradlew installDebug
```

## Testing

### Unit Tests

```bash
# Run all unit tests
./gradlew test

# Run specific test class
./gradlew test --tests "com.tucker.customer.ui.home.HomeViewModelTest"

# Run with coverage
./gradlew testDebugUnitTestCoverage
```

### Instrumented Tests

```bash
# Run all instrumented tests
./gradlew connectedAndroidTest

# Run specific test class
./gradlew connectedAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.tucker.customer.ui.order.OrderFlowTest
```

### Test Coverage Requirements

- Minimum unit test coverage: 70%
- All ViewModels must have unit tests
- All UseCases must have unit tests
- Critical user flows must have instrumented tests

### Test Examples

**ViewModel Test:**
```kotlin
// app/src/test/java/com/tucker/customer/ui/home/HomeViewModelTest.kt
class HomeViewModelTest {
    @get:Rule
    val dispatcherRule = TestDispatcherRule()

    private lateinit var viewModel: HomeViewModel
    private lateinit var getMerchantsUseCase: GetMerchantsUseCase

    @Before
    fun setup() {
        getMerchantsUseCase = mockk()
        viewModel = HomeViewModel(getMerchantsUseCase)
    }

    @Test
    fun `loadMerchants success updates state`() = runTest {
        // Given
        val merchants = listOf(Merchant.mock())
        coEvery { getMerchantsUseCase() } returns Result.success(merchants)

        // When
        viewModel.loadMerchants()

        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertEquals(merchants, state.merchants)
            assertFalse(state.isLoading)
            assertNull(state.error)
        }
    }

    @Test
    fun `loadMerchants failure updates error state`() = runTest {
        // Given
        val error = Exception("Network error")
        coEvery { getMerchantsUseCase() } returns Result.failure(error)

        // When
        viewModel.loadMerchants()

        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertTrue(state.merchants.isEmpty())
            assertNotNull(state.error)
        }
    }
}
```

**Compose UI Test:**
```kotlin
// app/src/androidTest/java/com/tucker/customer/ui/order/OrderFlowTest.kt
@HiltAndroidTest
class OrderFlowTest {
    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)

    @get:Rule(order = 1)
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Before
    fun setup() {
        hiltRule.inject()
    }

    @Test
    fun completeOrderFlow() {
        // Select merchant
        composeRule.onNodeWithTag("merchant_card").performClick()

        // Add item to cart
        composeRule.onNodeWithTag("add_to_cart").performClick()

        // Go to cart
        composeRule.onNodeWithTag("cart_tab").performClick()

        // Checkout
        composeRule.onNodeWithTag("checkout_button").performClick()

        // Confirm order
        composeRule.onNodeWithTag("confirm_order").performClick()

        // Verify success
        composeRule.onNodeWithText("Order Placed Successfully").assertIsDisplayed()
    }
}
```
