import SwiftUI

struct ProductFormView: View {
    let product: Product?
    let onSave: () -> Void

    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var description = ""
    @State private var price = ""
    @State private var originalPrice = ""
    @State private var image = ""
    @State private var isAvailable = true
    @State private var isSaving = false
    @State private var error: String?

    var isEditing: Bool { product != nil }

    var body: some View {
        Form {
            Section("Basic Info") {
                TextField("Product Name", text: $name)

                TextField("Description", text: $description, axis: .vertical)
                    .lineLimit(3...6)
            }

            Section("Pricing") {
                HStack {
                    Text("¥")
                    TextField("Price", text: $price)
                        .keyboardType(.decimalPad)
                }

                HStack {
                    Text("¥")
                    TextField("Original Price (optional)", text: $originalPrice)
                        .keyboardType(.decimalPad)
                }
            }

            Section("Image") {
                TextField("Image URL", text: $image)

                if !image.isEmpty {
                    AsyncImage(url: URL(string: image)) { image in
                        image.resizable().aspectRatio(contentMode: .fit)
                    } placeholder: {
                        Color.gray.opacity(0.2)
                    }
                    .frame(height: 150)
                    .cornerRadius(8)
                }
            }

            Section {
                Toggle("Available", isOn: $isAvailable)
            }

            if let error = error {
                Section {
                    Text(error)
                        .foregroundColor(.tuckerError)
                }
            }
        }
        .navigationTitle(isEditing ? "Edit Product" : "Add Product")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button("Cancel") {
                    dismiss()
                }
            }

            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    saveProduct()
                } label: {
                    if isSaving {
                        ProgressView()
                    } else {
                        Text("Save")
                    }
                }
                .disabled(name.isEmpty || price.isEmpty || isSaving)
            }
        }
        .onAppear {
            if let product = product {
                name = product.name
                description = product.description ?? ""
                price = String(format: "%.2f", product.price)
                originalPrice = product.originalPrice.map { String(format: "%.2f", $0) } ?? ""
                image = product.image ?? ""
                isAvailable = product.isAvailable
            }
        }
    }

    private func saveProduct() {
        guard let priceValue = Double(price) else {
            error = "Invalid price"
            return
        }

        let originalPriceValue = Double(originalPrice)
        isSaving = true
        error = nil

        Task {
            do {
                if let product = product {
                    // Update existing
                    _ = try await APIService.shared.updateProduct(
                        id: product.id,
                        name: name,
                        description: description.isEmpty ? nil : description,
                        price: priceValue,
                        originalPrice: originalPriceValue,
                        image: image.isEmpty ? nil : image,
                        categoryId: nil,
                        isAvailable: isAvailable
                    )
                } else {
                    // Create new
                    _ = try await APIService.shared.createProduct(
                        name: name,
                        description: description.isEmpty ? nil : description,
                        price: priceValue,
                        originalPrice: originalPriceValue,
                        image: image.isEmpty ? nil : image,
                        categoryId: nil,
                        isAvailable: isAvailable
                    )
                }

                onSave()
                dismiss()
            } catch {
                self.error = error.localizedDescription
            }
            isSaving = false
        }
    }
}
