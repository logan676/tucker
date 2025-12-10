import SwiftUI

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

// MARK: - Hex Color Initializer
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Theme Configuration
struct TuckerTheme {
    // Spacing
    static let spacingXS: CGFloat = 4
    static let spacingSM: CGFloat = 8
    static let spacingMD: CGFloat = 16
    static let spacingLG: CGFloat = 24
    static let spacingXL: CGFloat = 32

    // Border Radius
    static let radiusSmall: CGFloat = 4
    static let radiusMedium: CGFloat = 8
    static let radiusLarge: CGFloat = 12
    static let radiusFull: CGFloat = 9999

    // Font Sizes
    static let fontH1: CGFloat = 24
    static let fontH2: CGFloat = 20
    static let fontH3: CGFloat = 18
    static let fontBody: CGFloat = 16
    static let fontCaption: CGFloat = 14
    static let fontSmall: CGFloat = 12
}
