import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthManager

    var body: some View {
        NavigationStack {
            if authManager.isAuthenticated {
                List {
                    // User Info Section
                    Section {
                        NavigationLink {
                            EditProfileView()
                        } label: {
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
                                        .foregroundColor(.primary)
                                    Text(authManager.currentUser?.phone ?? "")
                                        .font(.subheadline)
                                        .foregroundColor(.gray)
                                }

                                Spacer()

                                Text("Edit")
                                    .font(.caption)
                                    .foregroundColor(.tuckerOrange)
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

// MARK: - Address List View

struct AddressListView: View {
    @State private var addresses: [Address] = []
    @State private var isLoading = true
    @State private var showAddAddress = false
    @State private var editingAddress: Address?
    @State private var showDeleteAlert = false
    @State private var addressToDelete: Address?
    @State private var error: String?

    var body: some View {
        ZStack {
            Color(.systemGray6).ignoresSafeArea()

            if isLoading {
                ProgressView()
            } else if addresses.isEmpty {
                emptyState
            } else {
                addressList
            }
        }
        .navigationTitle("My Addresses")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    showAddAddress = true
                } label: {
                    Image(systemName: "plus")
                        .foregroundColor(.tuckerOrange)
                }
            }
        }
        .sheet(isPresented: $showAddAddress) {
            AddAddressView(onSave: { newAddress in
                addresses.append(newAddress)
            })
        }
        .sheet(item: $editingAddress) { address in
            EditAddressView(address: address) { updatedAddress in
                if let index = addresses.firstIndex(where: { $0.id == updatedAddress.id }) {
                    addresses[index] = updatedAddress
                }
            }
        }
        .alert("Delete Address", isPresented: $showDeleteAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                if let address = addressToDelete {
                    Task { await deleteAddress(address) }
                }
            }
        } message: {
            Text("Are you sure you want to delete this address?")
        }
        .task {
            await loadAddresses()
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "location.slash")
                .font(.system(size: 48))
                .foregroundColor(.gray)
            Text("No addresses saved")
                .font(.headline)
                .foregroundColor(.gray)
            Text("Add your delivery address to get started")
                .font(.caption)
                .foregroundColor(.gray)
            Button {
                showAddAddress = true
            } label: {
                HStack {
                    Image(systemName: "plus")
                    Text("Add Address")
                }
                .fontWeight(.medium)
                .foregroundColor(.white)
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
                .background(Color.tuckerOrange)
                .cornerRadius(20)
            }
        }
    }

    private var addressList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(addresses) { address in
                    AddressCard(
                        address: address,
                        onEdit: { editingAddress = address },
                        onDelete: {
                            addressToDelete = address
                            showDeleteAlert = true
                        },
                        onSetDefault: {
                            Task { await setDefault(address) }
                        }
                    )
                }
            }
            .padding()
        }
        .refreshable {
            await loadAddresses()
        }
    }

    private func loadAddresses() async {
        isLoading = true
        do {
            addresses = try await APIService.shared.getAddresses()
        } catch {
            self.error = "Failed to load addresses"
        }
        isLoading = false
    }

    private func deleteAddress(_ address: Address) async {
        do {
            try await APIService.shared.deleteAddress(id: address.id)
            addresses.removeAll { $0.id == address.id }
        } catch {
            self.error = "Failed to delete address"
        }
    }

    private func setDefault(_ address: Address) async {
        do {
            let updated = try await APIService.shared.setDefaultAddress(id: address.id)
            // Update all addresses - only one can be default
            addresses = addresses.map { addr in
                if addr.id == updated.id {
                    return updated
                } else {
                    // Create a new address with isDefault = false
                    return Address(
                        id: addr.id,
                        label: addr.label,
                        name: addr.name,
                        phone: addr.phone,
                        province: addr.province,
                        city: addr.city,
                        district: addr.district,
                        detail: addr.detail,
                        isDefault: false
                    )
                }
            }
        } catch {
            self.error = "Failed to set default address"
        }
    }
}

// MARK: - Address Card
struct AddressCard: View {
    let address: Address
    let onEdit: () -> Void
    let onDelete: () -> Void
    let onSetDefault: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                HStack(spacing: 8) {
                    Text(address.name)
                        .fontWeight(.semibold)
                    Text(address.phone)
                        .foregroundColor(.gray)
                }

                if let label = address.label, !label.isEmpty {
                    Text(label)
                        .font(.caption2)
                        .foregroundColor(.tuckerOrange)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.tuckerOrange.opacity(0.1))
                        .cornerRadius(4)
                }

                if address.isDefault {
                    Text("Default")
                        .font(.caption2)
                        .foregroundColor(.white)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.tuckerOrange)
                        .cornerRadius(4)
                }

                Spacer()
            }
            .font(.subheadline)

            // Address
            Text("\(address.district) \(address.detail)")
                .font(.subheadline)
                .foregroundColor(.gray)
                .lineLimit(2)

            Divider()

            // Actions
            HStack(spacing: 24) {
                Button {
                    onEdit()
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "pencil")
                        Text("Edit")
                    }
                    .font(.caption)
                    .foregroundColor(.primary)
                }

                Button {
                    onDelete()
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "trash")
                        Text("Delete")
                    }
                    .font(.caption)
                    .foregroundColor(.red)
                }

                Spacer()

                if !address.isDefault {
                    Button {
                        onSetDefault()
                    } label: {
                        Text("Set as Default")
                            .font(.caption)
                            .foregroundColor(.tuckerOrange)
                    }
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
    }
}

// MARK: - Edit Address View
struct EditAddressView: View {
    let address: Address
    let onSave: (Address) -> Void
    @Environment(\.dismiss) var dismiss

    @State private var label: String = ""
    @State private var name: String = ""
    @State private var phone: String = ""
    @State private var state: String = ""
    @State private var city: String = ""
    @State private var suburb: String = ""
    @State private var detail: String = ""
    @State private var isDefault: Bool = false
    @State private var isSaving = false
    @State private var error: String?

    init(address: Address, onSave: @escaping (Address) -> Void) {
        self.address = address
        self.onSave = onSave
        _label = State(initialValue: address.label ?? "")
        _name = State(initialValue: address.name)
        _phone = State(initialValue: address.phone)
        _state = State(initialValue: address.province)
        _city = State(initialValue: address.city)
        _suburb = State(initialValue: address.district)
        _detail = State(initialValue: address.detail)
        _isDefault = State(initialValue: address.isDefault)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Contact") {
                    TextField("Name", text: $name)
                    TextField("Phone", text: $phone)
                        .keyboardType(.phonePad)
                }

                Section("Address") {
                    TextField("State (e.g. QLD)", text: $state)
                    TextField("City (e.g. Brisbane)", text: $city)
                    TextField("Suburb (e.g. CBD)", text: $suburb)
                    TextField("Street Address", text: $detail)
                }

                Section("Label (Optional)") {
                    Picker("Label", selection: $label) {
                        Text("None").tag("")
                        Text("Home").tag("Home")
                        Text("Work").tag("Work")
                        Text("Other").tag("Other")
                    }
                    .pickerStyle(.segmented)
                }

                Section {
                    Toggle("Set as default address", isOn: $isDefault)
                }
            }
            .navigationTitle("Edit Address")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task { await saveAddress() }
                    }
                    .disabled(isSaving || name.isEmpty || phone.isEmpty || detail.isEmpty)
                }
            }
            .alert("Error", isPresented: .constant(error != nil)) {
                Button("OK") { error = nil }
            } message: {
                Text(error ?? "")
            }
        }
    }

    private func saveAddress() async {
        isSaving = true
        do {
            let updated = try await APIService.shared.updateAddress(
                id: address.id,
                label: label.isEmpty ? nil : label,
                name: name,
                phone: phone,
                province: state,
                city: city,
                district: suburb,
                detail: detail,
                isDefault: isDefault
            )
            onSave(updated)
            dismiss()
        } catch {
            self.error = "Failed to save address"
        }
        isSaving = false
    }
}

struct FavoritesView: View {
    @State private var favorites: [Favorite] = []
    @State private var isLoading = true
    @State private var error: String?

    var body: some View {
        ZStack {
            Color(.systemGray6).ignoresSafeArea()

            if isLoading {
                ProgressView()
            } else if favorites.isEmpty {
                emptyState
            } else {
                favoritesList
            }
        }
        .navigationTitle("Favorites")
        .task {
            await loadFavorites()
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "heart.slash")
                .font(.system(size: 48))
                .foregroundColor(.gray)
            Text("No favorites yet")
                .font(.headline)
                .foregroundColor(.gray)
            Text("Tap the heart on restaurants to add them here")
                .font(.caption)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
        .padding()
    }

    private var favoritesList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(favorites) { favorite in
                    if let merchant = favorite.merchant {
                        NavigationLink(destination: MerchantDetailView(merchantId: merchant.id)) {
                            FavoriteMerchantCard(
                                merchant: merchant,
                                onRemove: {
                                    Task { await removeFavorite(favorite) }
                                }
                            )
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
            }
            .padding()
        }
        .refreshable {
            await loadFavorites()
        }
    }

    private func loadFavorites() async {
        isLoading = true
        do {
            favorites = try await APIService.shared.getFavorites()
        } catch {
            self.error = "Failed to load favorites"
        }
        isLoading = false
    }

    private func removeFavorite(_ favorite: Favorite) async {
        do {
            try await APIService.shared.removeFavorite(merchantId: favorite.merchantId)
            favorites.removeAll { $0.id == favorite.id }
        } catch {
            self.error = "Failed to remove favorite"
        }
    }
}

// MARK: - Favorite Merchant Card
struct FavoriteMerchantCard: View {
    let merchant: Merchant
    let onRemove: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: merchant.logo ?? "")) { image in
                image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle().fill(Color.gray.opacity(0.2))
            }
            .frame(width: 80, height: 80)
            .cornerRadius(8)

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(merchant.name)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)

                    if !merchant.isOpen {
                        Text("Closed")
                            .font(.caption2)
                            .foregroundColor(.white)
                            .padding(.horizontal, 4)
                            .padding(.vertical, 2)
                            .background(Color.gray)
                            .cornerRadius(2)
                    }
                }

                HStack(spacing: 8) {
                    HStack(spacing: 2) {
                        Image(systemName: "star.fill")
                            .foregroundColor(.tuckerOrange)
                            .font(.caption2)
                        Text(String(format: "%.1f", merchant.rating))
                            .foregroundColor(.tuckerOrange)
                            .font(.caption)
                            .fontWeight(.medium)
                    }
                    Text("\(merchant.monthlySales)+ orders")
                        .foregroundColor(.gray)
                        .font(.caption)
                }

                HStack(spacing: 8) {
                    Text("$\(Int(merchant.deliveryFee)) delivery")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text("Min $\(Int(merchant.minOrderAmount))")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }

            Spacer()

            Button {
                onRemove()
            } label: {
                Image(systemName: "heart.fill")
                    .font(.title3)
                    .foregroundColor(.red)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
    }
}

struct CouponsView: View {
    @State private var coupons: [Coupon] = []
    @State private var isLoading = true
    @State private var selectedTab: CouponTab = .available

    var body: some View {
        VStack(spacing: 0) {
            // Tab Bar
            HStack(spacing: 0) {
                ForEach(CouponTab.allCases, id: \.self) { tab in
                    Button {
                        selectedTab = tab
                    } label: {
                        VStack(spacing: 8) {
                            Text(tab.title)
                                .font(.subheadline)
                                .fontWeight(selectedTab == tab ? .semibold : .regular)
                                .foregroundColor(selectedTab == tab ? .tuckerOrange : .gray)

                            Rectangle()
                                .fill(selectedTab == tab ? Color.tuckerOrange : Color.clear)
                                .frame(height: 2)
                        }
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .padding(.horizontal)
            .background(Color.white)

            // Content
            ZStack {
                Color(.systemGray6).ignoresSafeArea()

                if isLoading {
                    ProgressView()
                } else if coupons.isEmpty {
                    emptyState
                } else {
                    couponsList
                }
            }
        }
        .navigationTitle("My Coupons")
        .task {
            await loadCoupons()
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "ticket")
                .font(.system(size: 48))
                .foregroundColor(.gray)
            Text("No coupons available")
                .font(.headline)
                .foregroundColor(.gray)
            Text("Check back later for special offers!")
                .font(.caption)
                .foregroundColor(.gray)
        }
    }

    private var couponsList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(coupons) { coupon in
                    MyCouponCard(coupon: coupon)
                }
            }
            .padding()
        }
        .refreshable {
            await loadCoupons()
        }
    }

    private func loadCoupons() async {
        isLoading = true
        do {
            coupons = try await APIService.shared.getAvailableCoupons()
        } catch {
            print("Error loading coupons: \(error)")
        }
        isLoading = false
    }
}

enum CouponTab: CaseIterable {
    case available, used, expired

    var title: String {
        switch self {
        case .available: return "Available"
        case .used: return "Used"
        case .expired: return "Expired"
        }
    }
}

// MARK: - My Coupon Card
struct MyCouponCard: View {
    let coupon: Coupon

    var body: some View {
        HStack(spacing: 0) {
            // Left - Discount
            VStack(spacing: 4) {
                if coupon.discountType == "percentage" {
                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text("\(Int(coupon.discountValue))")
                            .font(.system(size: 28, weight: .bold))
                        Text("%")
                            .font(.subheadline)
                    }
                    Text("OFF")
                        .font(.caption)
                } else {
                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text("$")
                            .font(.subheadline)
                        Text("\(Int(coupon.discountValue))")
                            .font(.system(size: 28, weight: .bold))
                    }
                    Text("OFF")
                        .font(.caption)
                }
            }
            .foregroundColor(.white)
            .frame(width: 80)
            .frame(maxHeight: .infinity)
            .background(
                LinearGradient(colors: [.tuckerOrange, .red], startPoint: .topLeading, endPoint: .bottomTrailing)
            )

            // Right - Details
            VStack(alignment: .leading, spacing: 8) {
                Text(coupon.name)
                    .font(.subheadline)
                    .fontWeight(.semibold)

                if let description = coupon.description {
                    Text(description)
                        .font(.caption)
                        .foregroundColor(.gray)
                        .lineLimit(2)
                }

                HStack {
                    Text(coupon.minOrderText)
                        .font(.caption2)
                        .foregroundColor(.gray)

                    Spacer()

                    Text("Code: \(coupon.code)")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.tuckerOrange)
                }

                Text("Valid until \(formatDate(coupon.endDate))")
                    .font(.caption2)
                    .foregroundColor(.gray)
            }
            .padding(12)
        }
        .frame(height: 110)
        .background(Color.white)
        .cornerRadius(8)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }

    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "d MMM yyyy"
            return displayFormatter.string(from: date)
        }
        return dateString
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
