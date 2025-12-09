import SwiftUI

@main
struct TuckerApp: App {
    @StateObject private var authManager = AuthManager()
    @StateObject private var cartManager = CartManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(cartManager)
        }
    }
}
