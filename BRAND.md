# Tucker Brand Guidelines

## Brand Identity

**Tucker** - Local Food Delivery Platform
Slogan: "Good food, delivered fast"

## Logo

The Tucker logo features a location pin with fork and spoon icons, representing food delivery.
- Location: `/assets/logo/` (to be added)
- App Icon: Rounded square with warm orange background

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Tucker Orange | `#D97706` | rgb(217, 119, 6) | Primary brand color, buttons, CTAs |
| Tucker Dark | `#B45309` | rgb(180, 83, 9) | Text, headers, emphasis |
| Tucker Light | `#FBBF24` | rgb(251, 191, 36) | Highlights, secondary actions |

### Neutral Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Cream | `#FEF3C7` | rgb(254, 243, 199) | Light backgrounds, cards |
| Warm White | `#FFFBEB` | rgb(255, 251, 235) | Page backgrounds |
| Dark Gray | `#44403C` | rgb(68, 64, 60) | Body text |
| Medium Gray | `#78716C` | rgb(120, 113, 108) | Secondary text |
| Light Gray | `#F5F5F4` | rgb(245, 245, 244) | Borders, dividers |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| Success | `#16A34A` | Order completed, positive feedback |
| Warning | `#EAB308` | Pending, attention needed |
| Error | `#DC2626` | Errors, failed orders |
| Info | `#0EA5E9` | Information, tips |

## Typography

### Font Family
- **Primary**: System fonts (SF Pro for iOS, Roboto for Android)
- **Chinese**: PingFang SC / Noto Sans SC

### Font Sizes
- Heading 1: 24px / Bold
- Heading 2: 20px / Semibold
- Heading 3: 18px / Semibold
- Body: 16px / Regular
- Caption: 14px / Regular
- Small: 12px / Regular

## Platform-Specific Values

### iOS (SwiftUI)
```swift
extension Color {
    static let tuckerOrange = Color(hex: "D97706")
    static let tuckerDark = Color(hex: "B45309")
    static let tuckerLight = Color(hex: "FBBF24")
    static let tuckerCream = Color(hex: "FEF3C7")
}
```

### Android (Jetpack Compose)
```kotlin
val TuckerOrange = Color(0xFFD97706)
val TuckerDark = Color(0xFFB45309)
val TuckerLight = Color(0xFFFBBF24)
val TuckerCream = Color(0xFFFEF3C7)
```

### Web (CSS/Tailwind)
```css
:root {
  --tucker-orange: #D97706;
  --tucker-dark: #B45309;
  --tucker-light: #FBBF24;
  --tucker-cream: #FEF3C7;
}
```

### Ant Design Theme Token
```javascript
{
  colorPrimary: '#D97706',
  colorLink: '#D97706',
  colorSuccess: '#16A34A',
  colorWarning: '#EAB308',
  colorError: '#DC2626',
  colorInfo: '#0EA5E9',
}
```

## Spacing

Base unit: 4px

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

## Border Radius

- Small: 4px (tags, chips)
- Medium: 8px (cards, inputs)
- Large: 12px (modals, large cards)
- Full: 9999px (pills, avatars)

## Shadows

```css
/* Card shadow */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

/* Elevated shadow */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

/* Modal shadow */
box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
```

## Image Guidelines

### Product Images
- Aspect ratio: 1:1 (square)
- Minimum size: 400x400px
- Format: JPEG (photos), PNG (graphics)
- Background: White or food-styled

### Banner Images
- Aspect ratio: 16:9 or 2:1
- Minimum width: 800px
- Format: JPEG

### Merchant Logos
- Aspect ratio: 1:1 (square)
- Minimum size: 200x200px
- Format: PNG with transparency preferred

## Icon Guidelines

- Style: Outlined for navigation, filled for selected states
- Size: 24px (standard), 20px (small), 32px (large)
- Color: Use semantic colors based on context
