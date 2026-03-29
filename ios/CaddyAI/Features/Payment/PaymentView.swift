import SwiftUI

struct PaymentView: View {
    let requestCode: String

    @State private var paymentRequest: PaymentRequestWithContext?
    @State private var isLoading = true
    @State private var payerName = ""
    @State private var payerEmail = ""
    @State private var isProcessing = false
    @State private var showWebView = false
    @State private var checkoutURL: URL?
    @State private var errorMessage: String?

    var body: some View {
        ZStack {
            Color.gray50.ignoresSafeArea()

            if isLoading {
                LoadingView(message: "Loading payment details...")
            } else if let request = paymentRequest {
                if request.status == "paid" {
                    alreadyPaidView
                } else {
                    paymentForm(request)
                }
            } else {
                errorView
            }
        }
        .onAppear {
            loadPaymentRequest()
        }
        .sheet(isPresented: $showWebView) {
            if let url = checkoutURL {
                SafariView(url: url)
            }
        }
    }

    // MARK: - Already Paid View
    private var alreadyPaidView: some View {
        VStack(spacing: 24) {
            Spacer()

            VStack(spacing: 16) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.success)

                Text("Already Paid!")
                    .font(.heading1)
                    .foregroundColor(.gray900)

                Text("This payment has already been completed. Thank you!")
                    .font(.bodyMedium)
                    .foregroundColor(.gray500)
                    .multilineTextAlignment(.center)
            }

            Spacer()
        }
        .padding(32)
    }

    // MARK: - Error View
    private var errorView: some View {
        VStack(spacing: 24) {
            Spacer()

            VStack(spacing: 16) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 64))
                    .foregroundColor(.error)

                Text("Payment Not Found")
                    .font(.heading2)
                    .foregroundColor(.gray900)

                Text("This payment link is invalid or has expired.")
                    .font(.bodyMedium)
                    .foregroundColor(.gray500)
                    .multilineTextAlignment(.center)
            }

            Spacer()
        }
        .padding(32)
    }

    // MARK: - Payment Form
    private func paymentForm(_ request: PaymentRequestWithContext) -> some View {
        ScrollView {
            VStack(spacing: 0) {
                // Header
                paymentHeader(request)

                // Form
                VStack(spacing: 24) {
                    // Description
                    if let description = request.fund.description {
                        Text(description)
                            .font(.bodyMedium)
                            .foregroundColor(.gray600)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(Color.gray100)
                            .cornerRadius(12)
                    }

                    // Form Fields
                    VStack(spacing: 16) {
                        CaddyTextField(
                            placeholder: "Your Name",
                            text: $payerName,
                            icon: "person"
                        )

                        CaddyTextField(
                            placeholder: "Your Email",
                            text: $payerEmail,
                            icon: "envelope",
                            keyboardType: .emailAddress
                        )
                    }

                    // Error Message
                    if let error = errorMessage {
                        Text(error)
                            .font(.bodySmall)
                            .foregroundColor(.error)
                    }

                    // Pay Button
                    CaddyButton(
                        title: "Pay \(request.amountFormatted)",
                        action: {
                            processPayment()
                        },
                        icon: "creditcard",
                        isLoading: isProcessing
                    )
                    .disabled(payerName.isEmpty || payerEmail.isEmpty)

                    // Security Note
                    HStack(spacing: 8) {
                        Image(systemName: "lock.fill")
                            .font(.system(size: 12))
                        Text("Secure payment powered by Stripe")
                            .font(.bodySmall)
                    }
                    .foregroundColor(.gray500)

                    // Payment Methods
                    paymentMethods
                }
                .padding(24)
            }
        }
    }

    // MARK: - Payment Header
    private func paymentHeader(_ request: PaymentRequestWithContext) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "dollarsign.circle.fill")
                .font(.system(size: 48))
                .foregroundColor(.white.opacity(0.9))

            Text(request.tripName)
                .font(.bodyMedium)
                .foregroundColor(.white.opacity(0.8))

            Text(request.fund.name)
                .font(.heading2)
                .foregroundColor(.white)

            Text(request.amountFormatted)
                .font(.priceDisplay)
                .foregroundColor(.white)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
        .padding(.horizontal, 24)
        .background(
            LinearGradient(
                colors: [.forest, .forestDark],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }

    // MARK: - Payment Methods
    private var paymentMethods: some View {
        VStack(spacing: 12) {
            Text("Accepted payment methods")
                .font(.bodySmall)
                .foregroundColor(.gray500)

            HStack(spacing: 12) {
                ForEach(["Visa", "Mastercard", "Amex", "Apple Pay"], id: \.self) { method in
                    Text(method)
                        .font(.caption)
                        .foregroundColor(.gray600)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color.white)
                        .cornerRadius(8)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.gray200, lineWidth: 1)
                        )
                }
            }
        }
    }

    // MARK: - Load Payment Request
    private func loadPaymentRequest() {
        isLoading = true
        errorMessage = nil

        Task {
            do {
                let request: PaymentRequestWithContext = try await APIClient.shared.request(
                    .getPaymentRequest(requestCode: requestCode)
                )

                await MainActor.run {
                    paymentRequest = request
                    payerEmail = request.email
                    payerName = request.name ?? ""
                    isLoading = false
                }
            } catch let error as APIError {
                await MainActor.run {
                    isLoading = false
                    switch error {
                    case .notFound, .httpError(statusCode: 404, _):
                        paymentRequest = nil // Will show error view
                    default:
                        errorMessage = error.localizedDescription
                    }
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = "Failed to load payment details"
                }
            }
        }
    }

    // MARK: - Process Payment
    private func processPayment() {
        isProcessing = true
        errorMessage = nil
        CaddyHaptics.light()

        Task {
            do {
                let checkout: CheckoutResponse = try await APIClient.shared.request(
                    .createCheckout(
                        requestCode: requestCode,
                        payerName: payerName,
                        payerEmail: payerEmail
                    )
                )

                await MainActor.run {
                    if let url = URL(string: checkout.checkoutUrl) {
                        CaddyHaptics.success()
                        checkoutURL = url
                        showWebView = true
                    } else {
                        CaddyHaptics.error()
                        errorMessage = "Invalid checkout URL"
                    }
                    isProcessing = false
                }
            } catch {
                await MainActor.run {
                    CaddyHaptics.error()
                    isProcessing = false
                    errorMessage = "Failed to create checkout session. Please try again."
                }
            }
        }
    }
}

// MARK: - Safari View (for Stripe Checkout)
import SafariServices

struct SafariView: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> SFSafariViewController {
        SFSafariViewController(url: url)
    }

    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
}

#Preview {
    PaymentView(requestCode: "pay_demo123")
}
