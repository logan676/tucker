import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var phone = ""
    @State private var code = ""
    @State private var isCodeSent = false
    @State private var countdown = 0
    @State private var timer: Timer?

    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                Spacer()

                // Logo
                VStack(spacing: 8) {
                    Image(systemName: "storefront.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.blue)

                    Text("Tucker Merchant")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("Merchant Portal")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.bottom, 40)

                // Phone Input
                VStack(alignment: .leading, spacing: 8) {
                    Text("Phone Number")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    HStack {
                        Text("+86")
                            .foregroundColor(.secondary)

                        TextField("Enter phone number", text: $phone)
                            .keyboardType(.phonePad)
                            .disabled(isCodeSent)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                }

                // Code Input
                if isCodeSent {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Verification Code")
                            .font(.subheadline)
                            .foregroundColor(.secondary)

                        HStack {
                            TextField("Enter code", text: $code)
                                .keyboardType(.numberPad)

                            if countdown > 0 {
                                Text("\(countdown)s")
                                    .foregroundColor(.secondary)
                            } else {
                                Button("Resend") {
                                    sendCode()
                                }
                                .foregroundColor(.blue)
                            }
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }
                }

                // Error Message
                if let error = authManager.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                }

                // Action Button
                Button {
                    if isCodeSent {
                        login()
                    } else {
                        sendCode()
                    }
                } label: {
                    if authManager.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text(isCodeSent ? "Login" : "Get Code")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(phone.count >= 11 ? Color.blue : Color.gray)
                .foregroundColor(.white)
                .cornerRadius(12)
                .disabled(phone.count < 11 || authManager.isLoading)

                Spacer()

                // Dev hint
                Text("Dev: 13800138000 / 123456")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
            .navigationBarHidden(true)
        }
    }

    private func sendCode() {
        Task {
            do {
                try await authManager.sendCode(phone: phone)
                isCodeSent = true
                startCountdown()
            } catch {
                // Error handled by AuthManager
            }
        }
    }

    private func login() {
        Task {
            do {
                try await authManager.login(phone: phone, code: code)
            } catch {
                // Error handled by AuthManager
            }
        }
    }

    private func startCountdown() {
        countdown = 60
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if countdown > 0 {
                countdown -= 1
            } else {
                timer?.invalidate()
            }
        }
    }
}
