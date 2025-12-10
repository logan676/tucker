import SwiftUI

// MARK: - Tucker Brand Colors
extension Color {
    // 品牌主题色 (Brand Theme Colors)
    static let tuckerOchre = Color(hex: "D97B28")      // 焦糖赭石 - 品牌主色
    static let tuckerCream = Color(hex: "FFF8E7")      // 暖乳白 - 品牌辅助色
    static let tuckerDarkGrey = Color(hex: "3E3A35")   // 深暖灰 - 品牌文本色

    // 产品主题色 (Product Theme Colors - UI Palette)
    static let tuckerPrimary = Color(hex: "D97B28")    // 主色 - CTA、按钮、价格高亮
    static let tuckerSecondary = Color(hex: "F2C99C")  // 辅助色 - 次级按钮、标签背景

    // 背景与层级
    static let tuckerBackground = Color(hex: "F9F6F0") // 全局背景
    static let tuckerSurface = Color.white             // 卡片/内容背景

    // 文本与图标
    static let tuckerTextPrimary = Color(hex: "2C2825")   // 主要文本
    static let tuckerTextSecondary = Color(hex: "75716C") // 次要文本
    static let tuckerPlaceholder = Color(hex: "BDB9B5")   // 提示/占位文本

    // 功能辅助色 (Semantic Colors)
    static let tuckerSuccess = Color(hex: "4CAF50")    // 成功 - 订单完成、评分高
    static let tuckerError = Color(hex: "E53935")      // 错误/警告 - 支付失败
    static let tuckerInfo = Color(hex: "1976D2")       // 链接/信息

    // 兼容旧代码别名
    static let tuckerOrange = tuckerOchre
    static let tuckerDark = tuckerDarkGrey
    static let tuckerLight = tuckerSecondary

    // Hex color initializer
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
            (a, r, g, b) = (255, 0, 0, 0)
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

struct ContentView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Home")
                }
                .tag(0)

            SearchView()
                .tabItem {
                    Image(systemName: "magnifyingglass")
                    Text("Search")
                }
                .tag(1)

            OrdersView()
                .tabItem {
                    Image(systemName: "list.bullet.rectangle")
                    Text("Orders")
                }
                .tag(2)

            ProfileView()
                .tabItem {
                    Image(systemName: "person.fill")
                    Text("Profile")
                }
                .tag(3)
        }
        .accentColor(.tuckerOrange)
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthManager())
        .environmentObject(CartManager())
}
