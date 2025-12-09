import SwiftUI

struct StoreSettingsView: View {
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var viewModel = StoreSettingsViewModel()

    var body: some View {
        NavigationView {
            List {
                if let merchant = viewModel.merchant {
                    // Store Info Section
                    Section("Store Information") {
                        NavigationLink {
                            EditStoreInfoView(merchant: merchant, onSave: {
                                viewModel.loadSettings()
                            })
                        } label: {
                            HStack {
                                AsyncImage(url: URL(string: merchant.logo ?? "")) { image in
                                    image.resizable().aspectRatio(contentMode: .fill)
                                } placeholder: {
                                    Image(systemName: "storefront.fill")
                                        .foregroundColor(.gray)
                                }
                                .frame(width: 50, height: 50)
                                .clipShape(RoundedRectangle(cornerRadius: 8))

                                VStack(alignment: .leading) {
                                    Text(merchant.name)
                                        .font(.headline)

                                    Text(merchant.description ?? "No description")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                        .lineLimit(2)
                                }
                            }
                        }
                    }

                    // Delivery Settings
                    Section("Delivery") {
                        HStack {
                            Text("Delivery Fee")
                            Spacer()
                            Text(String(format: "¥%.2f", merchant.deliveryFee ?? 0))
                                .foregroundColor(.secondary)
                        }

                        HStack {
                            Text("Delivery Time")
                            Spacer()
                            Text(merchant.deliveryTime ?? "30-45 min")
                                .foregroundColor(.secondary)
                        }

                        HStack {
                            Text("Min Order")
                            Spacer()
                            Text(String(format: "¥%.2f", merchant.minOrderAmount ?? 0))
                                .foregroundColor(.secondary)
                        }
                    }

                    // Stats
                    Section("Statistics") {
                        HStack {
                            Text("Rating")
                            Spacer()
                            HStack(spacing: 4) {
                                Image(systemName: "star.fill")
                                    .foregroundColor(.yellow)
                                Text(String(format: "%.1f", merchant.rating ?? 0))
                                Text("(\(merchant.ratingCount ?? 0))")
                                    .foregroundColor(.secondary)
                            }
                        }

                        HStack {
                            Text("Monthly Sales")
                            Spacer()
                            Text("\(merchant.monthlySales ?? 0)")
                                .foregroundColor(.secondary)
                        }
                    }
                }

                // Account Section
                Section("Account") {
                    HStack {
                        Text("Phone")
                        Spacer()
                        Text(authManager.currentUser?.phone ?? "")
                            .foregroundColor(.secondary)
                    }

                    Button(role: .destructive) {
                        authManager.logout()
                    } label: {
                        HStack {
                            Spacer()
                            Text("Logout")
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Store Settings")
            .refreshable {
                viewModel.loadSettings()
            }
            .task {
                viewModel.loadSettings()
            }
        }
    }
}

struct EditStoreInfoView: View {
    let merchant: Merchant
    let onSave: () -> Void

    @Environment(\.dismiss) private var dismiss

    @State private var name: String = ""
    @State private var description: String = ""
    @State private var logo: String = ""
    @State private var phone: String = ""
    @State private var address: String = ""
    @State private var deliveryFee: String = ""
    @State private var deliveryTime: String = ""
    @State private var minOrderAmount: String = ""
    @State private var isSaving = false
    @State private var error: String?

    var body: some View {
        Form {
            Section("Basic Info") {
                TextField("Store Name", text: $name)
                TextField("Description", text: $description, axis: .vertical)
                    .lineLimit(3...6)
                TextField("Logo URL", text: $logo)
            }

            Section("Contact") {
                TextField("Phone", text: $phone)
                    .keyboardType(.phonePad)
                TextField("Address", text: $address)
            }

            Section("Delivery") {
                HStack {
                    Text("¥")
                    TextField("Delivery Fee", text: $deliveryFee)
                        .keyboardType(.decimalPad)
                }

                TextField("Delivery Time (e.g., 30-45 min)", text: $deliveryTime)

                HStack {
                    Text("¥")
                    TextField("Min Order Amount", text: $minOrderAmount)
                        .keyboardType(.decimalPad)
                }
            }

            if let error = error {
                Section {
                    Text(error)
                        .foregroundColor(.red)
                }
            }
        }
        .navigationTitle("Edit Store")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    saveSettings()
                } label: {
                    if isSaving {
                        ProgressView()
                    } else {
                        Text("Save")
                    }
                }
                .disabled(name.isEmpty || isSaving)
            }
        }
        .onAppear {
            name = merchant.name
            description = merchant.description ?? ""
            logo = merchant.logo ?? ""
            phone = merchant.phone ?? ""
            address = merchant.address ?? ""
            deliveryFee = merchant.deliveryFee.map { String(format: "%.2f", $0) } ?? ""
            deliveryTime = merchant.deliveryTime ?? ""
            minOrderAmount = merchant.minOrderAmount.map { String(format: "%.2f", $0) } ?? ""
        }
    }

    private func saveSettings() {
        isSaving = true
        error = nil

        Task {
            do {
                _ = try await APIService.shared.updateStoreSettings(
                    name: name,
                    description: description.isEmpty ? nil : description,
                    logo: logo.isEmpty ? nil : logo,
                    banner: nil,
                    phone: phone.isEmpty ? nil : phone,
                    address: address.isEmpty ? nil : address,
                    deliveryFee: Double(deliveryFee),
                    deliveryTime: deliveryTime.isEmpty ? nil : deliveryTime,
                    minOrderAmount: Double(minOrderAmount)
                )

                onSave()
                dismiss()
            } catch {
                self.error = error.localizedDescription
            }
            isSaving = false
        }
    }
}
