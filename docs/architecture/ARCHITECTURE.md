# Tucker - Food Delivery Platform Architecture

## Overview

Tucker is a comprehensive food delivery platform targeting the **Australian market**, inspired by leading food delivery apps but adapted for Western user preferences and Australian business requirements.

### Target Market
- **Primary**: Australia (Brisbane, Sydney, Melbourne)
- **Language**: English (Australian)
- **Currency**: AUD ($)
- **Payment Methods**: Credit/Debit Cards, Apple Pay, Google Pay, PayPal, Afterpay

---

## Platform Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TUCKER PLATFORM                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ iOS Customer │  │ Android      │  │ Web Customer │  │ Admin        │ │
│  │ App          │  │ Customer App │  │ App          │  │ Dashboard    │ │
│  │ (Swift)      │  │ (Kotlin)     │  │ (Next.js)    │  │ (React)      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                 │                 │          │
│  ┌──────┴───────┐  ┌──────┴───────┐                                     │
│  │ iOS Merchant │  │ Android      │                                     │
│  │ App          │  │ Merchant App │                                     │
│  │ (Swift)      │  │ (Kotlin)     │                                     │
│  └──────┬───────┘  └──────┬───────┘                                     │
│         │                 │                                              │
│         └────────┬────────┴──────────────┬──────────────┬───────────────┘
│                  │                       │              │
│         ┌────────▼───────────────────────▼──────────────▼────────┐
│         │                    API GATEWAY                          │
│         │                   (NestJS REST API)                     │
│         └────────────────────────┬───────────────────────────────┘
│                                  │
│    ┌─────────────┬───────────────┼───────────────┬─────────────┐
│    │             │               │               │             │
│    ▼             ▼               ▼               ▼             ▼
│ ┌──────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ │Redis │   │PostgreSQL│   │  Stripe  │   │  Twilio  │   │  AWS S3  │
│ │Cache │   │ Database │   │ Payments │   │   SMS    │   │  Storage │
│ └──────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Backend API (apps/api)

### Technology Stack
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Real-time**: Socket.io (WebSocket)
- **API Documentation**: Swagger/OpenAPI

### Module Architecture

```
apps/api/src/
├── modules/
│   ├── auth/           # Authentication & SMS verification
│   ├── user/           # User management & addresses
│   ├── merchant/       # Merchant browsing & details
│   ├── product/        # Menu & product management
│   ├── order/          # Order lifecycle management
│   ├── payment/        # Stripe integration
│   ├── review/         # Ratings & reviews
│   ├── coupon/         # Promotions & discounts
│   ├── banner/         # Marketing banners
│   ├── notification/   # Push & WebSocket notifications
│   ├── search/         # Search & filtering
│   ├── admin/          # Admin operations
│   ├── merchant-owner/ # Merchant portal APIs
│   ├── redis/          # Cache service
│   └── sms/            # Twilio SMS service
├── common/
│   ├── guards/         # Auth guards
│   ├── decorators/     # Custom decorators
│   └── filters/        # Exception filters
└── database/
    ├── entities/       # TypeORM entities
    ├── migrations/     # Database migrations
    └── seeds/          # Seed data (Australian)
```

### Database Schema

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │     │    merchants    │     │    products     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │     │ id              │
│ phone           │     │ name            │     │ merchantId (FK) │
│ email           │     │ description     │     │ categoryId (FK) │
│ name            │     │ logo            │     │ name            │
│ avatar          │     │ banner          │     │ description     │
│ role            │     │ rating          │     │ image           │
│ membershipLevel │     │ monthlySales    │     │ price           │
└────────┬────────┘     │ minOrderAmount  │     │ originalPrice   │
         │              │ deliveryFee     │     │ monthlySales    │
         │              │ deliveryTime    │     │ isAvailable     │
         │              │ latitude        │     └─────────────────┘
         │              │ longitude       │
         │              │ status          │     ┌─────────────────┐
         │              └────────┬────────┘     │ product_categories│
         │                       │              ├─────────────────┤
┌────────▼────────┐     ┌────────▼────────┐    │ id              │
│   addresses     │     │    orders       │    │ merchantId (FK) │
├─────────────────┤     ├─────────────────┤    │ name            │
│ id              │     │ id              │    │ sortOrder       │
│ userId (FK)     │     │ orderNo         │    └─────────────────┘
│ label           │     │ userId (FK)     │
│ name            │     │ merchantId (FK) │    ┌─────────────────┐
│ phone           │     │ addressId (FK)  │    │   order_items   │
│ state           │     │ status          │    ├─────────────────┤
│ city            │     │ totalAmount     │    │ id              │
│ suburb          │     │ deliveryFee     │    │ orderId (FK)    │
│ postcode        │     │ discountAmount  │    │ productId (FK)  │
│ streetAddress   │     │ payAmount       │    │ quantity        │
│ isDefault       │     │ remark          │    │ price           │
└─────────────────┘     └─────────────────┘    └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    payments     │     │    reviews      │     │    coupons      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │     │ id              │
│ orderId (FK)    │     │ userId (FK)     │     │ code            │
│ amount          │     │ merchantId (FK) │     │ name            │
│ method          │     │ orderId (FK)    │     │ discountType    │
│ status          │     │ rating          │     │ discountValue   │
│ stripePaymentId │     │ content         │     │ minOrderAmount  │
│ expireAt        │     │ images          │     │ maxDiscount     │
└─────────────────┘     │ merchantReply   │     │ startDate       │
                        └─────────────────┘     │ endDate         │
┌─────────────────┐                             └─────────────────┘
│    banners      │     ┌─────────────────┐
├─────────────────┤     │  notifications  │     ┌─────────────────┐
│ id              │     ├─────────────────┤     │   categories    │
│ title           │     │ id              │     ├─────────────────┤
│ subtitle        │     │ userId (FK)     │     │ id              │
│ imageUrl        │     │ type            │     │ name            │
│ type            │     │ title           │     │ icon            │
│ actionType      │     │ content         │     │ sortOrder       │
│ actionValue     │     │ isRead          │     │ isActive        │
│ sortOrder       │     └─────────────────┘     └─────────────────┘
│ isActive        │
└─────────────────┘
```

### API Endpoints Overview

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | POST /auth/sms/send, POST /auth/login/phone | Phone-based authentication |
| Users | GET /users/me, PUT /users/me, GET /users/me/addresses | User profile & addresses |
| Merchants | GET /merchants, GET /merchants/:id, GET /merchants/:id/products | Restaurant browsing |
| Orders | POST /orders, GET /orders, GET /orders/:id, PUT /orders/:id/cancel | Order management |
| Payments | POST /payments, GET /payments/:id, POST /payments/:id/mock-pay | Payment processing |
| Reviews | POST /reviews, GET /merchants/:id/reviews | Review system |
| Coupons | GET /coupons, POST /coupons/:code/claim | Promotions |
| Banners | GET /banners | Marketing content |
| Search | GET /search | Search functionality |

---

## 2. iOS Customer App (apps/ios-customer)

### Technology Stack
- **Language**: Swift 5.9+
- **UI Framework**: SwiftUI
- **Minimum iOS**: 17.0
- **Architecture**: MVVM

### Feature Modules (per PRD)

```
apps/ios-customer/Tucker/
├── App/
│   └── TuckerApp.swift
├── Views/
│   ├── Home/
│   │   ├── HomeView.swift              # Main home page
│   │   ├── DeliveryHomeView.swift      # Delivery tab
│   │   ├── PickupHomeView.swift        # Pickup/Self-collect tab
│   │   └── Components/
│   │       ├── BannerCarousel.swift
│   │       ├── CategoryGrid.swift
│   │       ├── MerchantCard.swift
│   │       └── PromotionSection.swift
│   ├── Search/
│   │   ├── SearchView.swift            # Search results
│   │   ├── FilterSheet.swift           # Filter panel
│   │   └── CategoryBrowseView.swift    # Browse by category
│   ├── Merchant/
│   │   ├── MerchantDetailView.swift    # Restaurant detail
│   │   ├── MenuView.swift              # Menu/ordering
│   │   ├── ReviewsView.swift           # Reviews tab
│   │   ├── MerchantInfoView.swift      # Info tab
│   │   └── GalleryView.swift           # Photo gallery
│   ├── Cart/
│   │   ├── CartSheet.swift             # Cart popup
│   │   ├── CartView.swift              # Full cart page
│   │   └── CheckoutView.swift          # Checkout flow
│   ├── Order/
│   │   ├── OrdersView.swift            # Order list
│   │   ├── OrderDetailView.swift       # Order detail
│   │   ├── OrderTrackingView.swift     # Live tracking
│   │   └── ReviewOrderView.swift       # Post-order review
│   ├── Address/
│   │   ├── AddressListView.swift       # Address selection
│   │   ├── AddressFormView.swift       # Add/edit address
│   │   └── AddressSearchView.swift     # Location search
│   ├── Map/
│   │   ├── MapPickupView.swift         # Map-based store selection
│   │   └── MapAnnotations.swift        # Custom map markers
│   ├── Messages/
│   │   └── MessageCenterView.swift     # Notifications
│   ├── Profile/
│   │   ├── ProfileView.swift           # User profile
│   │   ├── SettingsView.swift          # App settings
│   │   └── CouponsView.swift           # My coupons
│   └── Payment/
│       └── PaymentView.swift           # Payment methods
├── ViewModels/
│   ├── HomeViewModel.swift
│   ├── SearchViewModel.swift
│   ├── MerchantViewModel.swift
│   ├── CartViewModel.swift
│   ├── OrderViewModel.swift
│   └── ProfileViewModel.swift
├── Models/
│   └── Models.swift                    # Data models
├── Services/
│   ├── APIService.swift                # Network layer
│   ├── LocationService.swift           # GPS & geocoding
│   └── WebSocketService.swift          # Real-time updates
├── Managers/
│   ├── AuthManager.swift               # Authentication
│   ├── CartManager.swift               # Cart state
│   └── LocationManager.swift           # Location
└── Utils/
    ├── TuckerColors.swift              # Brand colors
    ├── Constants.swift                 # App constants
    └── Extensions.swift                # Swift extensions
```

### Key Screens (PRD Alignment)

| PRD Section | Screen | Status |
|-------------|--------|--------|
| 2.1 Delivery Home | HomeView | Partial |
| 2.3 Pickup Home | PickupHomeView | Not Started |
| 3.1 Search Results | SearchView | Partial |
| 3.2 Filter Panel | FilterSheet | Not Started |
| 4.1-4.4 Merchant Detail | MerchantDetailView | Partial |
| 5.1 Address Selection | AddressListView | Not Started |
| 6.1-6.2 Cart | CartSheet, CartView | Partial |
| 7.1-7.2 Orders | OrdersView | Partial |
| 8.1 Map Pickup | MapPickupView | Not Started |
| 9.1 Messages | MessageCenterView | Not Started |

---

## 3. iOS Merchant App (apps/ios-merchant)

### Technology Stack
- **Language**: Swift 5.9+
- **UI Framework**: SwiftUI
- **Minimum iOS**: 17.0
- **Architecture**: MVVM

### Feature Modules

```
apps/ios-merchant/TuckerMerchant/
├── Views/
│   ├── Auth/
│   │   └── LoginView.swift
│   ├── Dashboard/
│   │   ├── DashboardView.swift         # Sales overview
│   │   └── MainTabView.swift           # Tab navigation
│   ├── Orders/
│   │   ├── OrdersView.swift            # Order management
│   │   └── OrderDetailView.swift       # Order details
│   ├── Products/
│   │   ├── ProductsView.swift          # Menu management
│   │   └── ProductFormView.swift       # Add/edit items
│   └── Settings/
│       └── StoreSettingsView.swift     # Store config
├── ViewModels/
│   ├── DashboardViewModel.swift
│   ├── OrdersViewModel.swift
│   ├── ProductsViewModel.swift
│   └── StoreSettingsViewModel.swift
├── Services/
│   └── APIService.swift
├── Managers/
│   └── AuthManager.swift
└── Models/
    └── Models.swift
```

### Status: **85% Complete**
- Authentication: Working
- Dashboard: Working
- Order Management: Working
- Product Management: Working

---

## 4. Android Apps

### Android Customer App (apps/android-customer)

**Technology Stack**:
- Language: Kotlin
- UI: Jetpack Compose
- Architecture: MVVM with Clean Architecture
- DI: Hilt
- Network: Retrofit + OkHttp

**Status**: 90% Complete - Checkout & Payment flows fully implemented

### Android Merchant App (apps/android-merchant)

**Status**: 85% Complete - Core features working

---

## 5. Web Customer App (apps/web)

### Technology Stack
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **HTTP**: Axios

### Status: Structure Ready, Implementation Needed

---

## 6. Admin Dashboard (apps/dashboard)

### Technology Stack
- **Framework**: React 18
- **Language**: TypeScript
- **UI Library**: Ant Design 5.x
- **State**: Zustand
- **Build**: Vite
- **Router**: React Router 6

### Feature Modules

```
apps/dashboard/src/
├── pages/
│   ├── dashboard/      # KPI overview
│   ├── merchants/      # Merchant management
│   ├── orders/         # Order management
│   ├── products/       # Product catalog
│   ├── users/          # User management
│   ├── marketing/      # Banners & coupons
│   └── settings/       # System settings
├── components/
│   └── layout/         # MainLayout, Sidebar
├── services/           # API services
├── stores/             # Zustand stores
└── types/              # TypeScript types
```

### Status: 60% Complete - Core CRUD pages working, charts placeholder

---

## Australian Market Adaptations

### 1. Localization
- **Language**: English (en-AU)
- **Currency**: AUD with $ symbol
- **Date Format**: DD/MM/YYYY
- **Time Format**: 12-hour with AM/PM
- **Phone Format**: 04XX XXX XXX (mobile), 02/03/07/08 XXXX XXXX (landline)

### 2. Address Format
```
Street Address
Suburb STATE Postcode

Example:
123 Queen Street
Brisbane QLD 4000
```

States: QLD, NSW, VIC, SA, WA, TAS, NT, ACT

### 3. Payment Methods
- Credit/Debit Cards (Visa, Mastercard, Amex)
- Apple Pay
- Google Pay
- PayPal
- Afterpay (buy now, pay later)

### 4. Delivery Partners
- DoorDash integration
- Uber Eats partnership (optional)
- In-house delivery fleet

### 5. Compliance
- Australian Consumer Law
- Privacy Act 1988
- Food Standards Australia New Zealand (FSANZ)
- GST (10%) handling

---

## Implementation Priority

### Phase 1: Core Customer Experience (Current Focus)
1. ✅ Backend API - Complete
2. ✅ iOS Customer App - Home, Search, Merchant Detail
3. 🔄 iOS Customer App - Cart, Checkout, Payment
4. 🔄 iOS Customer App - Orders, Reviews
5. ⬜ iOS Customer App - Pickup mode, Map selection

### Phase 2: Merchant Tools
1. ✅ iOS Merchant App - Core features
2. ✅ Android Merchant App - Core features
3. ⬜ Real-time order notifications
4. ⬜ Analytics dashboard

### Phase 3: Admin & Operations
1. 🔄 Admin Dashboard - Enhanced features
2. ⬜ Marketing tools
3. ⬜ Reporting & analytics

### Phase 4: Growth Features
1. ⬜ Loyalty program
2. ⬜ Subscription (Tucker Pass)
3. ⬜ Group ordering
4. ⬜ Scheduled orders

---

## Development Guidelines

### Code Style
- **Swift**: SwiftLint rules
- **Kotlin**: Ktlint
- **TypeScript**: ESLint + Prettier

### Git Workflow
- Main branch: Production-ready
- Feature branches: feature/[name]
- Pull requests required for merging

### Testing
- Unit tests for business logic
- UI tests for critical flows
- API integration tests

### Documentation
- Code comments for complex logic
- API documentation via Swagger
- README for each app

---

## Monitoring & Analytics

### Error Tracking
- Sentry for crash reporting

### Analytics
- Firebase Analytics (mobile)
- Google Analytics (web)
- Custom event tracking

### Performance
- API response time monitoring
- App startup time tracking
- Network request optimization

---

*Document Version: 2.0*
*Last Updated: December 2025*
*Target Market: Australia*
