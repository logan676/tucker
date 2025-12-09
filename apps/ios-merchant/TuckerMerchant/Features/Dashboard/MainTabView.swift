import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Label("Dashboard", systemImage: "chart.bar.fill")
                }
                .tag(0)

            OrdersView()
                .tabItem {
                    Label("Orders", systemImage: "list.bullet.rectangle")
                }
                .tag(1)

            ProductsView()
                .tabItem {
                    Label("Products", systemImage: "bag.fill")
                }
                .tag(2)

            StoreSettingsView()
                .tabItem {
                    Label("Store", systemImage: "gearshape.fill")
                }
                .tag(3)
        }
    }
}
