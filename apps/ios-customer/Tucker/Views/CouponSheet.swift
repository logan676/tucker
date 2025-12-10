import SwiftUI

struct CouponSheet: View {
    let merchantId: String?
    let orderAmount: Double
    let onSelect: (Coupon, Double) -> Void
    @Environment(\.dismiss) var dismiss

    @State private var coupons: [Coupon] = []
    @State private var isLoading = true
    @State private var couponCode = ""
    @State private var isValidating = false
    @State private var error: String?
    @State private var validationMessage: String?

    var body: some View {
        NavigationStack {
            ZStack {
                Color(.systemGray6).ignoresSafeArea()

                VStack(spacing: 0) {
                    // Coupon Code Input
                    couponCodeSection

                    // Available Coupons
                    if isLoading {
                        Spacer()
                        ProgressView()
                        Spacer()
                    } else if coupons.isEmpty {
                        emptyState
                    } else {
                        couponList
                    }
                }
            }
            .navigationTitle("Select Coupon")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .task {
                await loadCoupons()
            }
        }
    }

    // MARK: - Coupon Code Input
    private var couponCodeSection: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                HStack {
                    Image(systemName: "ticket")
                        .foregroundColor(.gray)
                    TextField("Enter coupon code", text: $couponCode)
                        .textInputAutocapitalization(.characters)
                        .autocorrectionDisabled()
                }
                .padding(12)
                .background(Color(.systemGray6))
                .cornerRadius(8)

                Button {
                    Task { await validateCode() }
                } label: {
                    if isValidating {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .frame(width: 60)
                    } else {
                        Text("Apply")
                            .fontWeight(.medium)
                            .frame(width: 60)
                    }
                }
                .foregroundColor(.white)
                .padding(.vertical, 12)
                .background(couponCode.isEmpty ? Color.gray : Color.tuckerOrange)
                .cornerRadius(8)
                .disabled(couponCode.isEmpty || isValidating)
            }

            if let message = validationMessage {
                HStack {
                    Image(systemName: error != nil ? "xmark.circle.fill" : "checkmark.circle.fill")
                    Text(message)
                }
                .font(.caption)
                .foregroundColor(error != nil ? .red : .green)
            }
        }
        .padding()
        .background(Color.white)
    }

    // MARK: - Empty State
    private var emptyState: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "ticket")
                .font(.system(size: 48))
                .foregroundColor(.gray)
            Text("No coupons available")
                .font(.headline)
                .foregroundColor(.gray)
            Text("Enter a coupon code above or check back later")
                .font(.caption)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
            Spacer()
        }
        .padding()
    }

    // MARK: - Coupon List
    private var couponList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(coupons) { coupon in
                    CouponCard(
                        coupon: coupon,
                        orderAmount: orderAmount,
                        onSelect: {
                            selectCoupon(coupon)
                        }
                    )
                }
            }
            .padding()
        }
    }

    // MARK: - Actions
    private func loadCoupons() async {
        isLoading = true
        do {
            coupons = try await APIService.shared.getAvailableCoupons(
                merchantId: merchantId,
                orderAmount: orderAmount
            )
        } catch {
            print("Error loading coupons: \(error)")
        }
        isLoading = false
    }

    private func validateCode() async {
        guard !couponCode.isEmpty, let merchantId = merchantId else { return }

        isValidating = true
        error = nil
        validationMessage = nil

        do {
            let response = try await APIService.shared.validateCoupon(
                code: couponCode,
                merchantId: merchantId,
                orderAmount: orderAmount
            )

            if response.valid, let coupon = response.coupon, let discount = response.discountAmount {
                validationMessage = "Coupon applied! You save $\(String(format: "%.2f", discount))"
                onSelect(coupon, discount)
                dismiss()
            } else {
                error = response.message ?? "Invalid coupon"
                validationMessage = response.message ?? "Invalid coupon code"
            }
        } catch {
            self.error = "Failed to validate coupon"
            validationMessage = "Failed to validate coupon"
        }
        isValidating = false
    }

    private func selectCoupon(_ coupon: Coupon) {
        // Calculate discount
        var discount: Double
        if coupon.discountType == "percentage" {
            discount = orderAmount * (coupon.discountValue / 100)
            if let maxDiscount = coupon.maxDiscount, discount > maxDiscount {
                discount = maxDiscount
            }
        } else {
            discount = coupon.discountValue
        }

        onSelect(coupon, discount)
        dismiss()
    }
}

// MARK: - Coupon Card
struct CouponCard: View {
    let coupon: Coupon
    let orderAmount: Double
    let onSelect: () -> Void

    var isEligible: Bool {
        orderAmount >= coupon.minOrderAmount
    }

    var discountAmount: Double {
        if coupon.discountType == "percentage" {
            var discount = orderAmount * (coupon.discountValue / 100)
            if let maxDiscount = coupon.maxDiscount, discount > maxDiscount {
                discount = maxDiscount
            }
            return discount
        } else {
            return coupon.discountValue
        }
    }

    var body: some View {
        HStack(spacing: 0) {
            // Left side - discount
            VStack(spacing: 4) {
                if coupon.discountType == "percentage" {
                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text("\(Int(coupon.discountValue))")
                            .font(.system(size: 32, weight: .bold))
                        Text("%")
                            .font(.headline)
                    }
                    Text("OFF")
                        .font(.caption)
                        .fontWeight(.medium)
                } else {
                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text("$")
                            .font(.headline)
                        Text("\(Int(coupon.discountValue))")
                            .font(.system(size: 32, weight: .bold))
                    }
                    Text("OFF")
                        .font(.caption)
                        .fontWeight(.medium)
                }
            }
            .foregroundColor(isEligible ? .white : .gray)
            .frame(width: 90)
            .frame(maxHeight: .infinity)
            .background(
                isEligible
                    ? LinearGradient(colors: [.tuckerOrange, .red], startPoint: .topLeading, endPoint: .bottomTrailing)
                    : LinearGradient(colors: [Color.gray.opacity(0.3), Color.gray.opacity(0.3)], startPoint: .topLeading, endPoint: .bottomTrailing)
            )

            // Right side - details
            VStack(alignment: .leading, spacing: 8) {
                Text(coupon.name)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(isEligible ? .primary : .gray)

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

                    if isEligible {
                        Text("Save $\(String(format: "%.0f", discountAmount))")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.red)
                    } else {
                        Text("Add $\(String(format: "%.0f", coupon.minOrderAmount - orderAmount)) more")
                            .font(.caption)
                            .foregroundColor(.tuckerOrange)
                    }
                }

                // Action button
                Button {
                    onSelect()
                } label: {
                    Text(isEligible ? "Use Now" : "Not Eligible")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(isEligible ? .tuckerOrange : .gray)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(
                            RoundedRectangle(cornerRadius: 4)
                                .stroke(isEligible ? Color.tuckerOrange : Color.gray, lineWidth: 1)
                        )
                }
                .disabled(!isEligible)
            }
            .padding(12)
        }
        .frame(height: 130)
        .background(Color.white)
        .cornerRadius(8)
        .overlay(
            // Decorative circles
            HStack(spacing: 0) {
                Circle()
                    .fill(Color(.systemGray6))
                    .frame(width: 16, height: 16)
                    .offset(x: -8)
                Spacer()
            }
            .frame(maxHeight: .infinity)
        )
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

#Preview {
    CouponSheet(
        merchantId: "1",
        orderAmount: 50.0
    ) { coupon, discount in
        print("Selected: \(coupon.name), discount: \(discount)")
    }
}
