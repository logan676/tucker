import SwiftUI

struct ProductsView: View {
    @StateObject private var viewModel = ProductsViewModel()
    @State private var showingAddProduct = false

    var body: some View {
        NavigationView {
            Group {
                if viewModel.isLoading && viewModel.products.isEmpty {
                    ProgressView()
                } else if viewModel.products.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "bag")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary)
                        Text("No products")
                            .foregroundColor(.secondary)

                        Button("Add Product") {
                            showingAddProduct = true
                        }
                        .buttonStyle(.bordered)
                    }
                } else {
                    List {
                        ForEach(viewModel.products) { product in
                            NavigationLink {
                                ProductFormView(
                                    product: product,
                                    onSave: { viewModel.loadProducts() }
                                )
                            } label: {
                                ProductRowView(
                                    product: product,
                                    onToggleAvailability: {
                                        viewModel.toggleAvailability(product)
                                    }
                                )
                            }
                        }
                        .onDelete { indexSet in
                            for index in indexSet {
                                viewModel.deleteProduct(viewModel.products[index])
                            }
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Products")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingAddProduct = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .refreshable {
                viewModel.loadProducts()
            }
            .task {
                viewModel.loadProducts()
            }
            .sheet(isPresented: $showingAddProduct) {
                NavigationView {
                    ProductFormView(
                        product: nil,
                        onSave: {
                            viewModel.loadProducts()
                            showingAddProduct = false
                        }
                    )
                }
            }
        }
    }
}

struct ProductRowView: View {
    let product: Product
    let onToggleAvailability: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: product.image ?? "")) { image in
                image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
                Color.gray.opacity(0.2)
            }
            .frame(width: 60, height: 60)
            .cornerRadius(8)

            VStack(alignment: .leading, spacing: 4) {
                Text(product.name)
                    .font(.headline)

                Text(String(format: "¥%.2f", product.price))
                    .font(.subheadline)
                    .foregroundColor(.red)

                if !product.isAvailable {
                    Text("Unavailable")
                        .font(.caption)
                        .foregroundColor(.white)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.red)
                        .cornerRadius(4)
                }
            }

            Spacer()

            Toggle("", isOn: Binding(
                get: { product.isAvailable },
                set: { _ in onToggleAvailability() }
            ))
            .labelsHidden()
        }
        .padding(.vertical, 4)
    }
}
