import SwiftUI

struct AddAddressView: View {
    @Environment(\.dismiss) var dismiss
    var onSave: (Address) -> Void

    @State private var label = ""
    @State private var name = ""
    @State private var phone = ""
    @State private var province = ""
    @State private var city = ""
    @State private var district = ""
    @State private var detail = ""
    @State private var isDefault = false
    @State private var isLoading = false
    @State private var error: String?

    let labels = ["Home", "Office", "School"]

    var body: some View {
        NavigationStack {
            Form {
                // Label Section
                Section("Label (optional)") {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(labels, id: \.self) { item in
                                Button {
                                    label = label == item ? "" : item
                                } label: {
                                    Text(item)
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 8)
                                        .background(label == item ? Color.orange : Color(.systemGray5))
                                        .foregroundColor(label == item ? .white : .primary)
                                        .cornerRadius(20)
                                }
                            }
                        }
                    }
                }

                // Contact Section
                Section("Contact") {
                    TextField("Name", text: $name)
                    TextField("Phone", text: $phone)
                        .keyboardType(.phonePad)
                }

                // Address Section
                Section("Address") {
                    TextField("Province", text: $province)
                    TextField("City", text: $city)
                    TextField("District", text: $district)
                    TextField("Detailed Address", text: $detail, axis: .vertical)
                        .lineLimit(2...4)
                }

                // Default Section
                Section {
                    Toggle("Set as default address", isOn: $isDefault)
                }
            }
            .navigationTitle("Add Address")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        Task { await saveAddress() }
                    }
                    .disabled(!isValid || isLoading)
                }
            }
            .alert("Error", isPresented: .constant(error != nil)) {
                Button("OK") { error = nil }
            } message: {
                Text(error ?? "")
            }
        }
    }

    var isValid: Bool {
        !name.isEmpty && !phone.isEmpty && !province.isEmpty &&
        !city.isEmpty && !district.isEmpty && !detail.isEmpty
    }

    private func saveAddress() async {
        isLoading = true
        do {
            let address = try await APIService.shared.createAddress(
                label: label.isEmpty ? nil : label,
                name: name,
                phone: phone,
                province: province,
                city: city,
                district: district,
                detail: detail,
                isDefault: isDefault
            )
            onSave(address)
            dismiss()
        } catch {
            self.error = "Failed to save address"
        }
        isLoading = false
    }
}

#Preview {
    AddAddressView { _ in }
}
