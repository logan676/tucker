# Tucker Brand Color Guide

This document defines the official brand colors and UI color palette for the Tucker platform.

## 1. Brand Theme Colors

These colors define Tucker's core visual identity - warm, inviting, and reminiscent of baked foods and Australian earth tones.

| Color Name | Chinese | HEX | Usage |
|------------|---------|-----|-------|
| Tucker Ochre | 焦糖赭石 | `#D97B28` | **Primary brand color.** Logo background, core marketing materials, primary CTAs (e.g., "Order Now"). Conveys warmth, deliciousness, and reliability. |
| Warm Cream | 暖乳白 | `#FFF8E7` | **Secondary brand color.** Logo body, brand background patterns. Softer than pure white, creates a vintage and cozy feel. |
| Dark Warm Grey | 深暖灰 | `#3E3A35` | **Brand text color.** Titles and important text. Replaces pure black for better harmony with warm tones. |

## 2. Product Theme Colors (UI Palette)

Based on brand colors, this palette is designed specifically for iOS/Android/Web interfaces, ensuring clear visual hierarchy, comfortable reading, and intuitive operations.

### Core Functional Colors

| Name | HEX | Usage |
|------|-----|-------|
| Primary | `#D97B28` | Key CTAs, selected tab bar items, primary buttons, price highlights, important icons |
| Secondary | `#F2C99C` | Light variant of primary. Secondary button backgrounds, tag backgrounds, progress bars |

### Background & Layers

| Name | HEX | Usage |
|------|-----|-------|
| Background | `#F9F6F0` | Very light warm grey. App global background, easier on eyes than pure white |
| Surface | `#FFFFFF` | Content cards (merchant list items, dish detail pages) for maximum clarity |

### Text & Icons

| Name | HEX | Usage |
|------|-----|-------|
| Primary Text | `#2C2825` | Deepest warm grey. Titles, important information |
| Secondary Text | `#75716C` | Medium grey. Descriptions, auxiliary info, unselected icons |
| Placeholder | `#BDB9B5` | Light grey. Search placeholders, disabled states |

### Semantic Colors

| Name | HEX | Usage |
|------|-----|-------|
| Success | `#4CAF50` | Soft green. Order completed, high ratings |
| Error | `#E53935` | Soft red. Payment failed, out of stock |
| Info | `#1976D2` | Soft blue. Clickable links, system prompts |

## 3. Platform Implementation

### iOS (SwiftUI)

```swift
// MARK: - Tucker Brand Colors
extension Color {
    // Brand Theme Colors
    static let tuckerOchre = Color(hex: "D97B28")      // Primary brand
    static let tuckerCream = Color(hex: "FFF8E7")      // Secondary brand
    static let tuckerDarkGrey = Color(hex: "3E3A35")   // Brand text

    // Product Theme Colors
    static let tuckerPrimary = Color(hex: "D97B28")    // CTA, buttons
    static let tuckerSecondary = Color(hex: "F2C99C")  // Secondary buttons

    // Background & Layers
    static let tuckerBackground = Color(hex: "F9F6F0") // Global background
    static let tuckerSurface = Color.white             // Card backgrounds

    // Text & Icons
    static let tuckerTextPrimary = Color(hex: "2C2825")   // Primary text
    static let tuckerTextSecondary = Color(hex: "75716C") // Secondary text
    static let tuckerPlaceholder = Color(hex: "BDB9B5")   // Placeholders

    // Semantic Colors
    static let tuckerSuccess = Color(hex: "4CAF50")    // Success states
    static let tuckerError = Color(hex: "E53935")      // Error states
    static let tuckerInfo = Color(hex: "1976D2")       // Info/links
}
```

### Android (Jetpack Compose)

```kotlin
// Tucker Brand Colors
object TuckerColors {
    // Brand Theme Colors
    val Ochre = Color(0xFFD97B28)
    val Cream = Color(0xFFFFF8E7)
    val DarkGrey = Color(0xFF3E3A35)

    // Product Theme Colors
    val Primary = Color(0xFFD97B28)
    val Secondary = Color(0xFFF2C99C)

    // Background & Layers
    val Background = Color(0xFFF9F6F0)
    val Surface = Color.White

    // Text & Icons
    val TextPrimary = Color(0xFF2C2825)
    val TextSecondary = Color(0xFF75716C)
    val Placeholder = Color(0xFFBDB9B5)

    // Semantic Colors
    val Success = Color(0xFF4CAF50)
    val Error = Color(0xFFE53935)
    val Info = Color(0xFF1976D2)
}
```

### Web (CSS/TypeScript)

```typescript
// Tucker Brand Colors
export const colors = {
  // Brand Theme Colors
  tuckerOchre: '#D97B28',
  tuckerCream: '#FFF8E7',
  tuckerDarkGrey: '#3E3A35',

  // Product Theme Colors
  primary: '#D97B28',
  secondary: '#F2C99C',

  // Background & Layers
  background: '#F9F6F0',
  surface: '#FFFFFF',

  // Text & Icons
  textPrimary: '#2C2825',
  textSecondary: '#75716C',
  placeholder: '#BDB9B5',

  // Semantic Colors
  success: '#4CAF50',
  error: '#E53935',
  info: '#1976D2',
};
```

### Dashboard (Ant Design Theme)

```typescript
// Ant Design theme config
const theme = {
  token: {
    colorPrimary: '#D97B28',
    colorSuccess: '#4CAF50',
    colorError: '#E53935',
    colorInfo: '#1976D2',
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F9F6F0',
    colorText: '#2C2825',
    colorTextSecondary: '#75716C',
  },
};
```

## 4. Usage Guidelines

1. **Primary Actions**: Always use Tucker Ochre (`#D97B28`) for primary CTAs
2. **Background Hierarchy**: Use `#F9F6F0` for page backgrounds, `#FFFFFF` for content cards
3. **Text Contrast**: Use Primary Text for titles, Secondary Text for descriptions
4. **Avoid Pure Black**: Use Dark Warm Grey (`#3E3A35`) instead of `#000000`
5. **Error States**: Use Error color (`#E53935`) sparingly, only for actual errors
6. **Success States**: Use Success color (`#4CAF50`) for positive confirmations
