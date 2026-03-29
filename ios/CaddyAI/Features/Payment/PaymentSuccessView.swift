import SwiftUI

struct PaymentSuccessView: View {
    let requestCode: String

    @State private var showConfetti = false

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [.forestLight, .white],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 32) {
                Spacer()

                // Success Icon
                VStack(spacing: 24) {
                    ZStack {
                        Circle()
                            .fill(Color.forest.opacity(0.15))
                            .frame(width: 120, height: 120)

                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 80))
                            .foregroundColor(.forest)
                            .scaleEffect(showConfetti ? 1.0 : 0.5)
                            .animation(.spring(response: 0.5, dampingFraction: 0.6), value: showConfetti)
                    }

                    // Party popper
                    Image(systemName: "party.popper.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.gold)
                        .offset(x: 50, y: -60)
                        .rotationEffect(.degrees(showConfetti ? 0 : -30))
                        .animation(.spring(response: 0.5, dampingFraction: 0.5).delay(0.3), value: showConfetti)
                }

                // Text
                VStack(spacing: 12) {
                    Text("Payment Successful!")
                        .font(.heading1)
                        .foregroundColor(.gray900)

                    Text("Thank you for your payment. The trip captain has been notified.")
                        .font(.bodyMedium)
                        .foregroundColor(.gray600)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                }

                Spacer()

                // What's Next Card
                CaddyCard {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("What happens next?")
                            .font(.labelMedium)
                            .foregroundColor(.gray900)

                        VStack(alignment: .leading, spacing: 12) {
                            nextStepRow(icon: "envelope.fill", text: "You'll receive an email confirmation shortly")
                            nextStepRow(icon: "person.fill", text: "The trip captain can see your payment")
                            nextStepRow(icon: "checkmark.seal.fill", text: "Your spot on the trip is confirmed!")
                        }
                    }
                }
                .padding(.horizontal, 24)

                // Reference
                Text("Payment reference: \(requestCode)")
                    .font(.caption)
                    .foregroundColor(.gray400)
                    .padding(.bottom, 32)
            }
        }
        .onAppear {
            withAnimation {
                showConfetti = true
            }
        }
    }

    private func nextStepRow(icon: String, text: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundColor(.forest)
                .frame(width: 24)

            Text(text)
                .font(.bodyMedium)
                .foregroundColor(.gray600)
        }
    }
}

#Preview {
    PaymentSuccessView(requestCode: "pay_demo123")
}
