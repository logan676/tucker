# Tucker Mobile Apps Documentation

This directory contains documentation for Tucker's mobile applications.

## Apps Overview

| App | Platform | Tech Stack | Status |
|-----|----------|------------|--------|
| [iOS Customer](./IOS.md) | iOS 16+ | Swift, SwiftUI | Complete |
| [Android Customer](./ANDROID.md) | Android SDK 26+ | Kotlin, Jetpack Compose | Complete |
| iOS Merchant | iOS 16+ | Swift, SwiftUI | Planned |
| Android Merchant | Android SDK 26+ | Kotlin, Jetpack Compose | Planned |

## Architecture

Both mobile apps follow similar architectural patterns:

```
┌─────────────────────────────────────────┐
│              Presentation               │
│  (SwiftUI Views / Compose Screens)      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│            State Management             │
│  (ObservableObject / ViewModel)         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│              Repository                 │
│     (Data access abstraction)           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│            API Service                  │
│   (URLSession / Retrofit)               │
└─────────────────┬───────────────────────┘
                  │
                  ▼
         Tucker Backend API
```

## Shared Features

### Customer Apps (iOS & Android)
- Phone authentication with SMS OTP
- Home feed with merchant discovery
- Restaurant menus with categories
- Shopping cart management
- Checkout and payment flow
- Order history and tracking
- User profile management
- Address management
- Location-based sorting

### Planned Features
- Push notifications
- Order real-time tracking
- In-app messaging
- Pickup mode
- Favorites and reviews

## Brand Guidelines

Both apps implement the Tucker brand colors consistently:

| Color | iOS | Android | Hex |
|-------|-----|---------|-----|
| Primary | `Color.tuckerOrange` | `TuckerColors.Primary` | `#D97B28` |
| Background | `Color.tuckerBackground` | `TuckerColors.Background` | `#F9F6F0` |
| Text Primary | `Color.tuckerTextPrimary` | `TuckerColors.TextPrimary` | `#2C2825` |
| Text Secondary | `Color.tuckerTextSecondary` | `TuckerColors.TextSecondary` | `#75716C` |

See [Brand Colors](../design/BRAND_COLORS.md) for complete guidelines.

## API Configuration

### Development
- iOS: `http://127.0.0.1:3000/api/v1`
- Android Emulator: `http://10.0.2.2:3000/api/v1`

### Production
- Both: `https://api.tucker.com/v1`

## Quick Start

### iOS
```bash
cd apps/ios-customer
open Tucker.xcodeproj
# Build and run in Xcode
```

### Android
```bash
cd apps/android-customer
./gradlew assembleDebug
# Or open in Android Studio
```

## Related Documentation

- [API Documentation](../api/)
- [Architecture Overview](../architecture/)
- [Brand Colors](../design/BRAND_COLORS.md)
