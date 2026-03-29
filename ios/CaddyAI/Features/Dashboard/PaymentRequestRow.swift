import SwiftUI

struct PaymentRequestRow: View {
    let request: PaymentRequest
    @State private var copied = false

    var body: some View {
        CaddyCard {
            HStack(spacing: 12) {
                // Status Icon
                statusIcon

                // Info
                VStack(alignment: .leading, spacing: 4) {
                    Text(request.name ?? request.email)
                        .font(.labelMedium)
                        .foregroundColor(.gray900)

                    if request.name != nil {
                        Text(request.email)
                            .font(.bodySmall)
                            .foregroundColor(.gray500)
                    }
                }

                Spacer()

                // Amount & Actions
                VStack(alignment: .trailing, spacing: 4) {
                    Text(formatCurrency(request.amount))
                        .font(.labelMedium)
                        .foregroundColor(.gray900)

                    statusBadge
                }

                // Copy Button (for pending requests)
                if request.status == "pending" {
                    Button {
                        copyPaymentLink()
                    } label: {
                        Image(systemName: copied ? "checkmark.circle.fill" : "doc.on.doc")
                            .foregroundColor(copied ? .success : .gray400)
                            .font(.system(size: 20))
                    }
                }
            }
        }
    }

    // MARK: - Status Icon
    private var statusIcon: some View {
        ZStack {
            Circle()
                .fill(statusColor.opacity(0.15))
                .frame(width: 40, height: 40)

            Image(systemName: statusIconName)
                .foregroundColor(statusColor)
                .font(.system(size: 16, weight: .semibold))
        }
    }

    private var statusColor: Color {
        switch request.status {
        case "paid": return .success
        case "pending": return .warning
        case "cancelled": return .error
        default: return .gray400
        }
    }

    private var statusIconName: String {
        switch request.status {
        case "paid": return "checkmark"
        case "pending": return "clock"
        case "cancelled": return "xmark"
        default: return "questionmark"
        }
    }

    // MARK: - Status Badge
    private var statusBadge: some View {
        Text(request.status.capitalized)
            .font(.caption)
            .foregroundColor(statusColor)
            .padding(.horizontal, 8)
            .padding(.vertical, 2)
            .background(statusColor.opacity(0.1))
            .cornerRadius(8)
    }

    // MARK: - Helpers
    private func formatCurrency(_ cents: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        return formatter.string(from: NSNumber(value: Double(cents) / 100)) ?? "$0"
    }

    private func copyPaymentLink() {
        let url = "https://your-app.com/pay/\(request.requestCode)"
        UIPasteboard.general.string = url
        copied = true

        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            copied = false
        }
    }
}

#Preview {
    VStack(spacing: 12) {
        PaymentRequestRow(
            request: PaymentRequest(
                id: "1",
                fundId: "f1",
                email: "john@email.com",
                name: "John Doe",
                amount: 50000,
                requestCode: "pay_123",
                status: "paid",
                sentAt: "2025-01-10",
                paidAt: "2025-01-12"
            )
        )

        PaymentRequestRow(
            request: PaymentRequest(
                id: "2",
                fundId: "f1",
                email: "mike@email.com",
                name: "Mike Smith",
                amount: 50000,
                requestCode: "pay_456",
                status: "pending",
                sentAt: "2025-01-10",
                paidAt: nil
            )
        )
    }
    .padding()
    .background(Color.gray50)
}
