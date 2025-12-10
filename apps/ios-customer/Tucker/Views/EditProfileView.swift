import SwiftUI

struct EditProfileView: View {
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) var dismiss

    @State private var name: String = ""
    @State private var avatarUrl: String = ""
    @State private var isSaving = false
    @State private var error: String?
    @State private var showSuccessAlert = false

    // Avatar options
    let avatarOptions = [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=tucker1",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=tucker2",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=tucker3",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=tucker4",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=tucker5",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=tucker6",
    ]

    var body: some View {
        NavigationStack {
            Form {
                // Avatar Section
                Section {
                    VStack(spacing: 16) {
                        // Current Avatar
                        AsyncImage(url: URL(string: avatarUrl.isEmpty ? (authManager.currentUser?.avatar ?? "") : avatarUrl)) { image in
                            image.resizable().aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 80))
                                .foregroundColor(.gray)
                        }
                        .frame(width: 100, height: 100)
                        .clipShape(Circle())
                        .overlay(
                            Circle()
                                .stroke(Color.tuckerOrange, lineWidth: 3)
                        )

                        Text("Choose an avatar")
                            .font(.caption)
                            .foregroundColor(.gray)

                        // Avatar Options
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 6), spacing: 12) {
                            ForEach(avatarOptions, id: \.self) { url in
                                Button {
                                    avatarUrl = url
                                } label: {
                                    AsyncImage(url: URL(string: url)) { image in
                                        image.resizable().aspectRatio(contentMode: .fill)
                                    } placeholder: {
                                        Circle().fill(Color.gray.opacity(0.2))
                                    }
                                    .frame(width: 44, height: 44)
                                    .clipShape(Circle())
                                    .overlay(
                                        Circle()
                                            .stroke(avatarUrl == url ? Color.tuckerOrange : Color.clear, lineWidth: 2)
                                    )
                                }
                            }
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                }

                // Name Section
                Section("Name") {
                    TextField("Your name", text: $name)
                        .textContentType(.name)
                }

                // Phone Section (read-only)
                Section("Phone") {
                    HStack {
                        Text(authManager.currentUser?.phone ?? "")
                            .foregroundColor(.primary)
                        Spacer()
                        Image(systemName: "lock.fill")
                            .foregroundColor(.gray)
                            .font(.caption)
                    }
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task { await saveProfile() }
                    }
                    .disabled(isSaving || name.isEmpty)
                    .fontWeight(.bold)
                    .foregroundColor(.tuckerOrange)
                }
            }
            .onAppear {
                name = authManager.currentUser?.name ?? ""
                avatarUrl = authManager.currentUser?.avatar ?? ""
            }
            .alert("Error", isPresented: .constant(error != nil)) {
                Button("OK") { error = nil }
            } message: {
                Text(error ?? "")
            }
            .alert("Success", isPresented: $showSuccessAlert) {
                Button("OK") { dismiss() }
            } message: {
                Text("Your profile has been updated")
            }
        }
    }

    private func saveProfile() async {
        isSaving = true
        do {
            let updatedUser = try await APIService.shared.updateUserProfile(
                name: name.isEmpty ? nil : name,
                avatar: avatarUrl.isEmpty ? nil : avatarUrl
            )
            await MainActor.run {
                authManager.currentUser = updatedUser
                showSuccessAlert = true
            }
        } catch {
            self.error = "Failed to update profile"
        }
        isSaving = false
    }
}

#Preview {
    EditProfileView()
        .environmentObject(AuthManager())
}
