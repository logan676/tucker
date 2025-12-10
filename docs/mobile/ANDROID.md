# Tucker Android Customer App

> Jetpack Compose-based food delivery customer application for Android SDK 26+

## Overview

The Android customer app provides a native mobile experience for ordering food from local restaurants. Built with Jetpack Compose and follows MVVM architecture with Hilt dependency injection.

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| UI Framework | Jetpack Compose | 1.5+ |
| Language | Kotlin | 1.9+ |
| Architecture | MVVM + Clean Architecture | - |
| DI | Hilt | 2.48+ |
| Networking | Retrofit + OkHttp | 2.9+ |
| Image Loading | Coil | 2.5+ |
| Navigation | Compose Navigation | 2.7+ |
| Coroutines | Kotlin Coroutines | 1.7+ |

## Project Structure

```
apps/android-customer/app/src/main/java/com/tucker/customer/
├── TuckerApplication.kt           # Application class with Hilt
├── MainActivity.kt                # Single activity entry point
├── di/
│   ├── AppModule.kt               # Hilt app-level dependencies
│   └── NetworkModule.kt           # Retrofit, OkHttp configuration
├── data/
│   ├── api/
│   │   └── ApiService.kt          # Retrofit API interface
│   ├── models/
│   │   └── Models.kt              # Data classes
│   └── repository/
│       ├── AuthRepository.kt      # Authentication operations
│       ├── MerchantRepository.kt  # Merchant operations
│       ├── OrderRepository.kt     # Order operations
│       └── UserRepository.kt      # User operations
├── ui/
│   ├── theme/
│   │   ├── Color.kt               # Tucker brand colors
│   │   ├── Theme.kt               # Material 3 theme
│   │   └── Type.kt                # Typography
│   ├── navigation/
│   │   └── NavGraph.kt            # Navigation routes
│   ├── components/
│   │   └── CommonComponents.kt    # Reusable UI components
│   ├── home/
│   │   ├── HomeScreen.kt          # Home feed
│   │   └── HomeViewModel.kt       # Home state management
│   ├── merchant/
│   │   ├── MerchantScreen.kt      # Restaurant detail
│   │   └── MerchantViewModel.kt   # Merchant state
│   ├── cart/
│   │   ├── CartScreen.kt          # Shopping cart
│   │   └── CartViewModel.kt       # Cart state
│   ├── checkout/
│   │   ├── CheckoutScreen.kt      # Checkout flow
│   │   └── CheckoutViewModel.kt   # Checkout state
│   ├── orders/
│   │   ├── OrdersScreen.kt        # Order history
│   │   └── OrdersViewModel.kt     # Orders state
│   ├── profile/
│   │   ├── ProfileScreen.kt       # User profile
│   │   └── ProfileViewModel.kt    # Profile state
│   └── auth/
│       ├── LoginScreen.kt         # Phone login
│       └── AuthViewModel.kt       # Auth state
└── util/
    └── Extensions.kt              # Kotlin extensions
```

## Key Features

### Implemented
- [x] Phone number authentication with SMS OTP
- [x] Home feed with categories and merchants
- [x] Merchant detail with menu
- [x] Shopping cart
- [x] Checkout flow with address selection
- [x] Payment selection (mock payment)
- [x] Order history
- [x] User profile
- [x] Material 3 theming
- [x] Dark mode support

### Planned
- [ ] Product customization options
- [ ] Order tracking with map
- [ ] Push notifications (FCM)
- [ ] Favorites system
- [ ] Reviews display
- [ ] Pickup mode

## Data Models

```kotlin
data class User(
    val id: String,
    val phone: String,
    val name: String?,
    val avatar: String?,
    val createdAt: String
)

data class Merchant(
    val id: String,
    val name: String,
    val logo: String?,
    val rating: Double,
    val deliveryFee: Double,
    val minOrderAmount: Double,
    val deliveryTime: String?,
    val isOpen: Boolean
)

data class Product(
    val id: String,
    val name: String,
    val description: String?,
    val price: Double,
    val image: String?,
    val isAvailable: Boolean
)

data class Order(
    val id: String,
    val orderNo: String,
    val status: String,
    val totalAmount: Double,
    val createdAt: String,
    val merchant: MerchantInfo?
)
```

## API Integration

### Retrofit Service
```kotlin
interface ApiService {
    // Auth
    @POST("auth/sms/send")
    suspend fun sendSmsCode(@Body request: SendSmsRequest)

    @POST("auth/login/phone")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    // Merchants
    @GET("merchants")
    suspend fun getMerchants(
        @Query("page") page: Int,
        @Query("lat") latitude: Double?,
        @Query("lng") longitude: Double?
    ): PaginatedResponse<Merchant>

    @GET("merchants/{id}")
    suspend fun getMerchant(@Path("id") id: String): Merchant

    @GET("merchants/{id}/products")
    suspend fun getMerchantMenu(@Path("id") id: String): MenuResponse

    // Orders
    @POST("orders")
    suspend fun createOrder(@Body request: CreateOrderRequest): CreateOrderResponse

    @GET("orders")
    suspend fun getOrders(@Query("page") page: Int): PaginatedResponse<Order>

    // Payments
    @POST("payments")
    suspend fun createPayment(@Body request: CreatePaymentRequest): PaymentResponse

    @GET("payments/{id}/mock-pay")
    suspend fun mockPay(@Path("id") paymentId: String): MockPayResponse
}
```

### Network Module
```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor())
            .addInterceptor(HttpLoggingInterceptor())
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl("http://10.0.2.2:3000/api/v1/")
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }
}
```

## State Management

### ViewModel Pattern
```kotlin
@HiltViewModel
class HomeViewModel @Inject constructor(
    private val merchantRepository: MerchantRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    fun loadMerchants() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            try {
                val merchants = merchantRepository.getMerchants()
                _uiState.update { it.copy(merchants = merchants, isLoading = false) }
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message, isLoading = false) }
            }
        }
    }
}

data class HomeUiState(
    val merchants: List<Merchant> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)
```

## Brand Colors

Defined in `Color.kt`:
```kotlin
object TuckerColors {
    val Primary = Color(0xFFD97B28)      // Tucker Orange
    val Secondary = Color(0xFFF2C99C)    // Light Orange
    val Background = Color(0xFFF9F6F0)   // Warm Background
    val Surface = Color.White
    val TextPrimary = Color(0xFF2C2825)  // Dark Warm Grey
    val TextSecondary = Color(0xFF75716C) // Medium Grey
    val Success = Color(0xFF4CAF50)
    val Error = Color(0xFFE53935)
}
```

## Building & Running

### Requirements
- Android Studio Hedgehog (2023.1.1) or later
- JDK 17
- Android SDK 34
- Backend API running (use 10.0.2.2 for emulator localhost)

### Steps
1. Open `apps/android-customer` in Android Studio
2. Sync Gradle files
3. Select device/emulator (API 26+)
4. Run app (Shift + F10)

### Build Variants
```groovy
buildTypes {
    debug {
        buildConfigField "String", "BASE_URL", "\"http://10.0.2.2:3000/api/v1/\""
    }
    release {
        buildConfigField "String", "BASE_URL", "\"https://api.tucker.com/v1/\""
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt')
    }
}
```

## Testing

```bash
# Run unit tests
./gradlew test

# Run instrumented tests
./gradlew connectedAndroidTest

# Run specific test
./gradlew testDebugUnitTest --tests "com.tucker.customer.HomeViewModelTest"
```

## Dependencies

```groovy
dependencies {
    // Compose
    implementation platform('androidx.compose:compose-bom:2024.02.00')
    implementation 'androidx.compose.ui:ui'
    implementation 'androidx.compose.material3:material3'

    // Navigation
    implementation 'androidx.navigation:navigation-compose:2.7.6'

    // Hilt
    implementation 'com.google.dagger:hilt-android:2.48'
    kapt 'com.google.dagger:hilt-compiler:2.48'
    implementation 'androidx.hilt:hilt-navigation-compose:1.1.0'

    // Retrofit
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'

    // Coil for images
    implementation 'io.coil-kt:coil-compose:2.5.0'

    // Coroutines
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
}
```

## Screenshots

| Home | Merchant | Cart | Checkout |
|------|----------|------|----------|
| Home feed | Restaurant menu | Shopping cart | Order checkout |
