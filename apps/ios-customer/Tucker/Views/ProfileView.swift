import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthManager

    var body: some View {
        NavigationStack {
            if authManager.isAuthenticated {
                List {
                    // User Info Section
                    Section {
                        HStack(spacing: 16) {
                            AsyncImage(url: URL(string: authManager.currentUser?.avatar ?? "")) { image in
                                image.resizable().aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Image(systemName: "person.circle.fill")
                                    .font(.system(size: 60))
                                    .foregroundColor(.gray)
                            }
                            .frame(width: 60, height: 60)
                            .clipShape(Circle())

                            VStack(alignment: .leading, spacing: 4) {
                                Text(authManager.currentUser?.name ?? "User")
                                    .font(.headline)
                                Text(authManager.currentUser?.phone ?? "")
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                            }
                        }
                        .padding(.vertical, 8)
                    }

                    // Menu Section
                    Section {
                        NavigationLink {
                            AddressListView()
                        } label: {
                            Label("My Addresses", systemImage: "location")
                        }

                        NavigationLink {
                            FavoritesView()
                        } label: {
                            Label("Favorites", systemImage: "heart")
                        }

                        NavigationLink {
                            CouponsView()
                        } label: {
                            Label("My Coupons", systemImage: "ticket")
                        }
                    }

                    // Settings Section
                    Section {
                        NavigationLink {
                            SettingsView()
                        } label: {
                            Label("Settings", systemImage: "gear")
                        }

                        NavigationLink {
                            HelpView()
                        } label: {
                            Label("Help & Support", systemImage: "questionmark.circle")
                        }

                        NavigationLink {
                            AboutView()
                        } label: {
                            Label("About", systemImage: "info.circle")
                        }
                    }

                    // Logout Section
                    Section {
                        Button(role: .destructive) {
                            authManager.logout()
                        } label: {
                            Label("Logout", systemImage: "rectangle.portrait.and.arrow.right")
                        }
                    }
                }
                .navigationTitle("Profile")
            } else {
                VStack(spacing: 16) {
                    Image(systemName: "person.circle")
                        .font(.system(size: 80))
                        .foregroundColor(.gray)
                    Text("Please login to view profile")
                        .foregroundColor(.gray)
                    NavigationLink(destination: LoginView()) {
                        Text("Login")
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                            .padding(.horizontal, 32)
                            .padding(.vertical, 12)
                            .background(Color.tuckerOrange)
                            .cornerRadius(20)
                    }
                }
                .navigationTitle("Profile")
            }
        }
    }
}

// MARK: - Placeholder Views

struct AddressListView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "location.slash")
                .font(.system(size: 48))
                .foregroundColor(.gray)
            Text("No addresses saved")
                .foregroundColor(.gray)
        }
        .navigationTitle("My Addresses")
    }
}

struct FavoritesView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "heart.slash")
                .font(.system(size: 48))
                .foregroundColor(.gray)
            Text("No favorites yet")
                .foregroundColor(.gray)
        }
        .navigationTitle("Favorites")
    }
}

struct CouponsView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "ticket")
                .font(.system(size: 48))
                .foregroundColor(.gray)
            Text("No coupons available")
                .foregroundColor(.gray)
        }
        .navigationTitle("My Coupons")
    }
}

struct SettingsView: View {
    var body: some View {
        List {
            Section("Notifications") {
                Toggle("Push Notifications", isOn: .constant(true))
                Toggle("Order Updates", isOn: .constant(true))
                Toggle("Promotions", isOn: .constant(false))
            }

            Section("Language") {
                HStack {
                    Text("Language")
                    Spacer()
                    Text("English")
                        .foregroundColor(.gray)
                }
            }
        }
        .navigationTitle("Settings")
    }
}

struct HelpView: View {
    var body: some View {
        List {
            Section {
                NavigationLink("FAQ") { Text("FAQ Content") }
                NavigationLink("Contact Us") { Text("Contact Info") }
                NavigationLink("Terms of Service") { Text("Terms") }
                NavigationLink("Privacy Policy") { Text("Privacy") }
            }
        }
        .navigationTitle("Help & Support")
    }
}

struct AboutView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "fork.knife.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(.tuckerOrange)
            Text("Tucker")
                .font(.title)
                .fontWeight(.bold)
            Text("Version 1.0.0")
                .foregroundColor(.gray)
            Text("Food delivery made easy")
                .font(.caption)
                .foregroundColor(.gray)
        }
        .navigationTitle("About")
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthManager())
}
