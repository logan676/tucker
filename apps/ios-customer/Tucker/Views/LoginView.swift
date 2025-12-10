import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) var dismiss

    @State private var phone = ""
    @State private var code = ""
    @State private var codeSent = false
    @State private var countdown = 0

    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Logo
            VStack(spacing: 8) {
                // Tucker Logo - Location pin with fork & spoon
                ZStack {
                    RoundedRectangle(cornerRadius: 20)
                        .fill(Color.tuckerOrange)
                        .frame(width: 100, height: 100)

                    VStack(spacing: 0) {
                        ZStack {
                            Circle()
                                .fill(Color.tuckerCream)
                                .frame(width: 60, height: 60)

                            HStack(spacing: 4) {
                                Image(systemName: "fork.knife")
                                    .font(.system(size: 24, weight: .medium))
                                    .foregroundColor(Color.tuckerDark)
                            }
                        }

                        // Pin point
                        Triangle()
                            .fill(Color.tuckerCream)
                            .frame(width: 20, height: 12)
                            .offset(y: -2)
                    }
                }

                Text("Tucker")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.tuckerDark)
                Text("Food delivery made easy")
                    .foregroundColor(.gray)
            }

            Spacer()

            // Form
            VStack(spacing: 16) {
                // Phone Input
                HStack {
                    Text("+86")
                        .foregroundColor(.gray)
                    TextField("Phone number", text: $phone)
                        .keyboardType(.phonePad)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)

                // Code Input
                HStack {
                    TextField("Verification code", text: $code)
                        .keyboardType(.numberPad)

                    Button {
                        Task { await sendCode() }
                    } label: {
                        if countdown > 0 {
                            Text("\(countdown)s")
                                .foregroundColor(.gray)
                        } else {
                            Text(codeSent ? "Resend" : "Send Code")
                                .foregroundColor(.tuckerOrange)
                        }
                    }
                    .disabled(phone.count < 11 || countdown > 0 || authManager.isLoading)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)

                // Error Message
                if let error = authManager.error {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                }

                // Login Button
                Button {
                    Task { await login() }
                } label: {
                    if authManager.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Login")
                            .fontWeight(.medium)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(canLogin ? Color.tuckerOrange : Color.gray)
                .foregroundColor(.white)
                .cornerRadius(10)
                .disabled(!canLogin || authManager.isLoading)
            }
            .padding(.horizontal)

            Spacer()

            // Terms
            Text("By logging in, you agree to our Terms of Service and Privacy Policy")
                .font(.caption)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .padding()
        .navigationBarTitleDisplayMode(.inline)
        .onReceive(timer) { _ in
            if countdown > 0 {
                countdown -= 1
            }
        }
        .onChange(of: authManager.isAuthenticated) { isAuthenticated in
            if isAuthenticated {
                dismiss()
            }
        }
    }

    var canLogin: Bool {
        phone.count >= 11 && code.count >= 4 && codeSent
    }

    private func sendCode() async {
        await authManager.sendCode(phone: phone)
        codeSent = true
        countdown = 60
    }

    private func login() async {
        await authManager.login(phone: phone, code: code)
    }
}

#Preview {
    NavigationStack {
        LoginView()
            .environmentObject(AuthManager())
    }
}
