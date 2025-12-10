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

    var icon: String {
        switch self {
        case .wechat: return "message.fill"
        case .alipay: return "a.circle.fill"
        case .card: return "creditcard.fill"
        }
    }

    var color: Color {
        switch self {
        case .wechat: return Color(red: 0.07, green: 0.73, blue: 0.31)
        case .alipay: return Color(red: 0.02, green: 0.68, blue: 0.94)
        case .card: return .purple
        }
    }

    var subtitle: String {
        switch self {
        case .wechat: return "Recommended"
        case .alipay: return "Quick payment"
        case .card: return "Visa, Mastercard, UnionPay"
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
            Color(.systemGray6).ignoresSafeArea()

            if isLoading {
                ProgressView()
                    .scaleEffect(1.2)
            } else if showSuccess {
                OrderSuccessView(order: order)
            } else {
                VStack(spacing: 0) {
                    ScrollView {
                        VStack(spacing: 16) {
                            // Amount Card
                            amountCard

                            // Countdown warning
                            if countdown < 300 {
                                countdownWarning
                            }

                            // Payment Methods
                            if paymentId == nil {
                                paymentMethodsSection
                            } else {
                                qrCodeSection
                            }
                        }
                        .padding()
                        .padding(.bottom, 100)
                    }

                    // Bottom action bar
                    if paymentId == nil {
                        payButton
                    } else {
                        simulatePaymentButton
                    }
                }
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

    private var amountCard: some View {
        VStack(spacing: 16) {
            // Timer
            HStack(spacing: 6) {
                Image(systemName: "clock")
                    .font(.caption)
                Text("Pay within")
                Text(formatTime(countdown))
                    .fontWeight(.semibold)
                    .foregroundColor(countdown < 300 ? .red : .tuckerOrange)
            }
            .font(.subheadline)
            .foregroundColor(.gray)

            // Amount
            VStack(spacing: 4) {
                Text("Amount Due")
                    .font(.caption)
                    .foregroundColor(.gray)
                HStack(alignment: .firstTextBaseline, spacing: 2) {
                    Text("¥")
                        .font(.title2)
                    Text(String(format: "%.2f", order?.payAmount ?? 0))
                        .font(.system(size: 48, weight: .bold))
                }
                .foregroundColor(.primary)
            }

            // Order info
            HStack(spacing: 16) {
                VStack(spacing: 2) {
                    Text("Order No.")
                        .font(.caption2)
                        .foregroundColor(.gray)
                    Text(order?.orderNo ?? "")
                        .font(.caption)
                        .fontWeight(.medium)
                }

                Divider()
                    .frame(height: 30)

                VStack(spacing: 2) {
                    Text("Items")
                        .font(.caption2)
                        .foregroundColor(.gray)
                    Text("\(order?.items?.count ?? 0)")
                        .font(.caption)
                        .fontWeight(.medium)
                }
            }
        }
        .padding(.vertical, 24)
        .padding(.horizontal)
        .frame(maxWidth: .infinity)
        .background(Color.white)
        .cornerRadius(16)
    }

    private var countdownWarning: some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundColor(.tuckerOrange)
            Text("Order will expire soon! Please complete payment.")
                .font(.caption)
                .foregroundColor(.tuckerOrange)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color.tuckerOrange.opacity(0.1))
        .cornerRadius(8)
    }

    private var paymentMethodsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Select Payment Method")
                .font(.headline)
                .padding(.horizontal, 4)

            VStack(spacing: 12) {
                ForEach(PaymentMethod.allCases, id: \.self) { method in
                    PaymentMethodRow(
                        method: method,
                        isSelected: selectedMethod == method,
                        onSelect: { selectedMethod = method }
                    )
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
    }

    private var qrCodeSection: some View {
        VStack(spacing: 20) {
            Text("Scan to Pay with \(selectedMethod.displayName)")
                .font(.subheadline)
                .foregroundColor(.gray)

            // QR Code placeholder
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(.systemGray6))
                    .frame(width: 200, height: 200)

                VStack(spacing: 12) {
                    Image(systemName: "qrcode")
                        .font(.system(size: 80))
                        .foregroundColor(.gray)
                    Text("Demo QR Code")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }

            Text("Open \(selectedMethod.displayName) app and scan the code")
                .font(.caption)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)

            Button {
                paymentId = nil
            } label: {
                Text("Change Payment Method")
                    .font(.subheadline)
                    .foregroundColor(.tuckerOrange)
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color.white)
        .cornerRadius(16)
    }

    private var payButton: some View {
        Button {
            Task { await initiatePayment() }
        } label: {
            HStack {
                if isProcessing {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else {
                    Image(systemName: selectedMethod.icon)
                    Text("Pay with \(selectedMethod.displayName)")
                        .fontWeight(.bold)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
        }
        .foregroundColor(.white)
        .background(
            countdown > 0
                ? LinearGradient(colors: [selectedMethod.color, selectedMethod.color.opacity(0.8)], startPoint: .leading, endPoint: .trailing)
                : LinearGradient(colors: [.gray, .gray], startPoint: .leading, endPoint: .trailing)
        )
        .disabled(isProcessing || countdown <= 0)
    }

    private var simulatePaymentButton: some View {
        VStack(spacing: 0) {
            Button {
                Task { await simulatePayment() }
            } label: {
                HStack {
                    if isProcessing {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Image(systemName: "checkmark.circle.fill")
                        Text("Complete Payment (Demo)")
                            .fontWeight(.bold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
            }
            .foregroundColor(.white)
            .background(Color.green)
            .disabled(isProcessing)
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
            HStack(spacing: 14) {
                // Icon
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(method.color)
                        .frame(width: 44, height: 44)

                    Image(systemName: method.icon)
                        .font(.title3)
                        .foregroundColor(.white)
                }

                // Text
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text(method.displayName)
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(.primary)

                        if method == .wechat {
                            Text("Recommended")
                                .font(.caption2)
                                .foregroundColor(.white)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.tuckerOrange)
                                .cornerRadius(4)
                        }
                    }

                    Text(method.subtitle)
                        .font(.caption)
                        .foregroundColor(.gray)
                }

                Spacer()

                // Selection indicator
                ZStack {
                    Circle()
                        .stroke(isSelected ? method.color : Color.gray.opacity(0.3), lineWidth: 2)
                        .frame(width: 22, height: 22)

                    if isSelected {
                        Circle()
                            .fill(method.color)
                            .frame(width: 14, height: 14)
                    }
                }
            }
            .padding()
            .background(isSelected ? method.color.opacity(0.05) : Color(.systemGray6))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? method.color : Color.clear, lineWidth: 1.5)
            )
        }
        .buttonStyle(.plain)
    }
}

struct OrderSuccessView: View {
    let order: Order?
    @Environment(\.dismiss) var dismiss
    @State private var animateCheck = false

    var body: some View {
        ZStack {
            Color(.systemGray6).ignoresSafeArea()

            VStack(spacing: 0) {
                ScrollView {
                    VStack(spacing: 20) {
                        Spacer().frame(height: 40)

                        // Success Animation
                        ZStack {
                            Circle()
                                .fill(Color.green.opacity(0.1))
                                .frame(width: 120, height: 120)
                                .scaleEffect(animateCheck ? 1 : 0.5)

                            Circle()
                                .fill(Color.green)
                                .frame(width: 90, height: 90)
                                .scaleEffect(animateCheck ? 1 : 0.5)

                            Image(systemName: "checkmark")
                                .font(.system(size: 44, weight: .bold))
                                .foregroundColor(.white)
                                .scaleEffect(animateCheck ? 1 : 0)
                        }
                        .animation(.spring(response: 0.5, dampingFraction: 0.6), value: animateCheck)

                        VStack(spacing: 8) {
                            Text("Payment Successful!")
                                .font(.title2)
                                .fontWeight(.bold)

                            Text("Your order has been confirmed")
                                .font(.subheadline)
                                .foregroundColor(.gray)
                        }

                        // Order Status Card
                        VStack(spacing: 16) {
                            // Progress steps
                            HStack(spacing: 0) {
                                OrderStep(icon: "checkmark.circle.fill", title: "Paid", isActive: true, isComplete: true)
                                StepConnector(isActive: true)
                                OrderStep(icon: "flame.fill", title: "Preparing", isActive: true, isComplete: false)
                                StepConnector(isActive: false)
                                OrderStep(icon: "bicycle", title: "On the way", isActive: false, isComplete: false)
                                StepConnector(isActive: false)
                                OrderStep(icon: "house.fill", title: "Delivered", isActive: false, isComplete: false)
                            }
                            .padding(.horizontal)

                            Divider()

                            // Estimated time
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Estimated Delivery")
                                        .font(.caption)
                                        .foregroundColor(.gray)
                                    Text("30-45 minutes")
                                        .font(.title3)
                                        .fontWeight(.bold)
                                        .foregroundColor(.tuckerOrange)
                                }

                                Spacer()

                                Image(systemName: "clock.fill")
                                    .font(.title)
                                    .foregroundColor(.tuckerOrange.opacity(0.3))
                            }
                            .padding(.horizontal)
                        }
                        .padding(.vertical)
                        .background(Color.white)
                        .cornerRadius(16)

                        // Order Details Card
                        if let order = order {
                            VStack(spacing: 0) {
                                HStack {
                                    Text("Order Details")
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                    Spacer()
                                }
                                .padding()
                                .background(Color(.systemGray6).opacity(0.5))

                                VStack(spacing: 12) {
                                    OrderInfoRow(label: "Order Number", value: order.orderNo)
                                    OrderInfoRow(label: "Payment Amount", value: "¥\(String(format: "%.2f", order.payAmount))", valueColor: .tuckerOrange)
                                    OrderInfoRow(label: "Payment Method", value: "WeChat Pay")
                                    OrderInfoRow(label: "Order Time", value: formatDate(Date()))
                                }
                                .padding()
                            }
                            .background(Color.white)
                            .cornerRadius(16)
                        }

                        // Contact rider section
                        HStack(spacing: 16) {
                            Button {
                                // Contact rider
                            } label: {
                                HStack {
                                    Image(systemName: "phone.fill")
                                    Text("Contact Rider")
                                }
                                .font(.subheadline)
                                .foregroundColor(.primary)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.white)
                                .cornerRadius(12)
                            }

                            Button {
                                // Contact merchant
                            } label: {
                                HStack {
                                    Image(systemName: "storefront.fill")
                                    Text("Contact Store")
                                }
                                .font(.subheadline)
                                .foregroundColor(.primary)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.white)
                                .cornerRadius(12)
                            }
                        }
                    }
                    .padding()
                    .padding(.bottom, 100)
                }

                // Bottom button
                Button {
                    dismiss()
                } label: {
                    Text("Back to Home")
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                }
                .foregroundColor(.white)
                .background(
                    LinearGradient(colors: [.tuckerOrange, .red], startPoint: .leading, endPoint: .trailing)
                )
            }
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                animateCheck = true
            }
        }
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d, yyyy h:mm a"
        return formatter.string(from: date)
    }
}

struct OrderStep: View {
    let icon: String
    let title: String
    let isActive: Bool
    let isComplete: Bool

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(isActive ? .tuckerOrange : .gray.opacity(0.4))
            Text(title)
                .font(.system(size: 9))
                .foregroundColor(isActive ? .primary : .gray.opacity(0.6))
        }
        .frame(maxWidth: .infinity)
    }
}

struct StepConnector: View {
    let isActive: Bool

    var body: some View {
        Rectangle()
            .fill(isActive ? Color.tuckerOrange : Color.gray.opacity(0.3))
            .frame(height: 2)
            .frame(maxWidth: 30)
    }
}

struct OrderInfoRow: View {
    let label: String
    let value: String
    var valueColor: Color = .primary

    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundColor(.gray)
            Spacer()
            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(valueColor)
        }
    }
}

#Preview {
    NavigationStack {
        PaymentView(orderId: "test-order-id")
    }
}
