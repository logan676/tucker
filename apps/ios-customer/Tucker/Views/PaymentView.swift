import SwiftUI

enum PaymentMethod: String, CaseIterable {
    case wechat = "wechat"
    case alipay = "alipay"
    case card = "card"

    var displayName: String {
        switch self {
        case .wechat: return "WeChat Pay"
        case .alipay: return "Alipay"
        case .card: return "Credit/Debit Card"
        }
    }

    var color: Color {
        switch self {
        case .wechat: return .green
        case .alipay: return .blue
        case .card: return .purple
        }
    }
}

struct PaymentView: View {
    let orderId: String
    @Environment(\.dismiss) var dismiss

    @State private var order: Order?
    @State private var selectedMethod: PaymentMethod = .wechat
    @State private var paymentId: String?
    @State private var isLoading = true
    @State private var isProcessing = false
    @State private var countdown = 900 // 15 minutes
    @State private var error: String?
    @State private var showSuccess = false

    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        ZStack {
            if isLoading {
                ProgressView()
            } else if showSuccess {
                OrderSuccessView(order: order)
            } else {
                ScrollView {
                    VStack(spacing: 20) {
                        // Countdown
                        Text("Time remaining: \(formatTime(countdown))")
                            .font(.subheadline)
                            .foregroundColor(.gray)

                        // Amount
                        VStack(spacing: 8) {
                            Text("Amount to Pay")
                                .foregroundColor(.gray)
                            Text("¥\(String(format: "%.2f", order?.payAmount ?? 0))")
                                .font(.system(size: 40, weight: .bold))
                                .foregroundColor(.orange)
                            Text("Order: \(order?.orderNo ?? "")")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.white)
                        .cornerRadius(12)

                        if paymentId == nil {
                            // Payment Method Selection
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Select Payment Method")
                                    .font(.headline)

                                ForEach(PaymentMethod.allCases, id: \.self) { method in
                                    PaymentMethodRow(
                                        method: method,
                                        isSelected: selectedMethod == method,
                                        onSelect: { selectedMethod = method }
                                    )
                                }
                            }
                            .padding()
                            .background(Color.white)
                            .cornerRadius(12)

                            // Pay Button
                            Button {
                                Task { await initiatePayment() }
                            } label: {
                                if isProcessing {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                } else {
                                    Text("Pay ¥\(String(format: "%.2f", order?.payAmount ?? 0))")
                                        .fontWeight(.bold)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(countdown > 0 ? Color.orange : Color.gray)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                            .disabled(isProcessing || countdown <= 0)
                        } else {
                            // Mock Payment UI
                            VStack(spacing: 16) {
                                Rectangle()
                                    .fill(Color(.systemGray5))
                                    .frame(width: 200, height: 200)
                                    .cornerRadius(12)
                                    .overlay(
                                        VStack {
                                            Text("Scan QR Code")
                                                .foregroundColor(.gray)
                                            Text("(Mock Payment)")
                                                .font(.caption)
                                                .foregroundColor(.gray)
                                        }
                                    )

                                Text("In production, this would show a \(selectedMethod.displayName) QR code")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                                    .multilineTextAlignment(.center)
                            }
                            .padding()
                            .background(Color.white)
                            .cornerRadius(12)

                            // Simulate Payment Button
                            Button {
                                Task { await simulatePayment() }
                            } label: {
                                if isProcessing {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                } else {
                                    Text("Simulate Successful Payment")
                                        .fontWeight(.bold)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                            .disabled(isProcessing)

                            Button {
                                paymentId = nil
                            } label: {
                                Text("Change Payment Method")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color(.systemGray5))
                            .foregroundColor(.primary)
                            .cornerRadius(12)
                        }
                    }
                    .padding()
                }
                .background(Color(.systemGray6))
            }
        }
        .navigationTitle("Payment")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(showSuccess)
        .task {
            await loadOrder()
        }
        .onReceive(timer) { _ in
            if countdown > 0 {
                countdown -= 1
            }
        }
        .alert("Error", isPresented: .constant(error != nil)) {
            Button("OK") { error = nil }
        } message: {
            Text(error ?? "")
        }
    }

    private func formatTime(_ seconds: Int) -> String {
        let mins = seconds / 60
        let secs = seconds % 60
        return String(format: "%02d:%02d", mins, secs)
    }

    private func loadOrder() async {
        isLoading = true
        do {
            order = try await APIService.shared.getOrder(id: orderId)
        } catch {
            self.error = "Failed to load order"
        }
        isLoading = false
    }

    private func initiatePayment() async {
        isProcessing = true
        do {
            let response = try await APIService.shared.createPayment(
                orderId: orderId,
                method: selectedMethod.rawValue
            )
            paymentId = response.paymentId
        } catch {
            self.error = "Failed to initiate payment"
        }
        isProcessing = false
    }

    private func simulatePayment() async {
        guard let paymentId = paymentId else { return }
        isProcessing = true
        do {
            try await APIService.shared.mockPayment(paymentId: paymentId)
            showSuccess = true
        } catch {
            self.error = "Payment failed"
        }
        isProcessing = false
    }
}

struct PaymentMethodRow: View {
    let method: PaymentMethod
    let isSelected: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            HStack(spacing: 12) {
                Circle()
                    .fill(method.color)
                    .frame(width: 40, height: 40)
                    .overlay(
                        Text(String(method.displayName.prefix(1)))
                            .foregroundColor(.white)
                            .fontWeight(.bold)
                    )

                Text(method.displayName)
                    .foregroundColor(.primary)

                Spacer()

                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(isSelected ? method.color : .gray)
            }
            .padding()
            .background(isSelected ? method.color.opacity(0.1) : Color(.systemGray6))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? method.color : Color.clear, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

struct OrderSuccessView: View {
    let order: Order?
    @Environment(\.dismiss) var dismiss

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Success Icon
            ZStack {
                Circle()
                    .fill(Color.green)
                    .frame(width: 80, height: 80)
                Image(systemName: "checkmark")
                    .font(.system(size: 40, weight: .bold))
                    .foregroundColor(.white)
            }

            Text("Order Placed Successfully!")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.green)

            Text("Your order is being prepared")
                .foregroundColor(.gray)

            // Order Info
            if let order = order {
                VStack(spacing: 12) {
                    HStack {
                        Text("Order Number")
                            .foregroundColor(.gray)
                        Spacer()
                        Text(order.orderNo)
                            .fontWeight(.medium)
                    }
                    HStack {
                        Text("Total Paid")
                            .foregroundColor(.gray)
                        Spacer()
                        Text("¥\(String(format: "%.2f", order.payAmount))")
                            .fontWeight(.bold)
                            .foregroundColor(.orange)
                    }
                }
                .padding()
                .background(Color.white)
                .cornerRadius(12)
            }

            // Estimated Time
            VStack(spacing: 8) {
                Text("Estimated Delivery Time")
                    .foregroundColor(.gray)
                Text("30-45 min")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.orange)
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.white)
            .cornerRadius(12)

            Spacer()

            // Back to Home
            Button {
                // Pop to root
                dismiss()
            } label: {
                Text("Back to Home")
                    .fontWeight(.medium)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.orange)
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
        }
        .padding()
        .background(Color(.systemGray6))
    }
}

#Preview {
    NavigationStack {
        PaymentView(orderId: "test-order-id")
    }
}
