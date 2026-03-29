import SwiftUI

struct AddRequestsSheet: View {
    let fundId: String
    let onComplete: () -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var requests: [NewPaymentRequest] = [NewPaymentRequest()]
    @State private var isSending = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    headerSection

                    // Request Forms
                    ForEach(requests.indices, id: \.self) { index in
                        requestForm(index: index)
                    }

                    // Add Another Button
                    addAnotherButton

                    // Error Message
                    if let error = errorMessage {
                        Text(error)
                            .font(.bodySmall)
                            .foregroundColor(.error)
                            .padding()
                    }
                }
                .padding(16)
            }
            .background(Color.gray50)
            .navigationTitle("Send Requests")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(.gray600)
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        sendRequests()
                    } label: {
                        if isSending {
                            ProgressView()
                        } else {
                            Text("Send")
                                .fontWeight(.semibold)
                        }
                    }
                    .foregroundColor(.forest)
                    .disabled(!isValid || isSending)
                }
            }
        }
    }

    // MARK: - Header Section
    private var headerSection: some View {
        VStack(spacing: 8) {
            Image(systemName: "paperplane.fill")
                .font(.system(size: 40))
                .foregroundColor(.forest)

            Text("Request Payments")
                .font(.heading3)
                .foregroundColor(.gray900)

            Text("Add group members to request payment")
                .font(.bodySmall)
                .foregroundColor(.gray500)
        }
        .padding(.vertical, 16)
    }

    // MARK: - Request Form
    private func requestForm(index: Int) -> some View {
        CaddyCard {
            VStack(spacing: 12) {
                HStack {
                    Text("Person \(index + 1)")
                        .font(.labelMedium)
                        .foregroundColor(.gray700)

                    Spacer()

                    if requests.count > 1 {
                        Button {
                            withAnimation {
                                _ = requests.remove(at: index)
                            }
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.gray400)
                        }
                    }
                }

                CaddyTextField(
                    placeholder: "Email *",
                    text: $requests[index].email,
                    icon: "envelope",
                    keyboardType: .emailAddress
                )

                CaddyTextField(
                    placeholder: "Name (optional)",
                    text: $requests[index].name,
                    icon: "person"
                )

                CaddyCurrencyField(
                    placeholder: "Amount *",
                    value: $requests[index].amount
                )
            }
        }
    }

    // MARK: - Add Another Button
    private var addAnotherButton: some View {
        Button {
            withAnimation {
                requests.append(NewPaymentRequest())
            }
        } label: {
            HStack {
                Image(systemName: "plus.circle.fill")
                Text("Add Another Person")
            }
            .font(.labelMedium)
            .foregroundColor(.forest)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .strokeBorder(style: StrokeStyle(lineWidth: 2, dash: [8]))
                    .foregroundColor(.gray300)
            )
        }
    }

    // MARK: - Validation
    private var isValid: Bool {
        requests.contains { request in
            !request.email.isEmpty && (request.amount ?? 0) > 0
        }
    }

    // MARK: - Send Requests
    private func sendRequests() {
        isSending = true
        errorMessage = nil
        CaddyHaptics.light()

        let validRequests = requests.filter {
            !$0.email.isEmpty && ($0.amount ?? 0) > 0
        }

        guard !validRequests.isEmpty else {
            errorMessage = "Please add at least one valid request"
            isSending = false
            return
        }

        guard let accessCode = AppState.shared.captainAccessCode else {
            errorMessage = "Missing access code"
            isSending = false
            return
        }

        let requestInputs = validRequests.map {
            PaymentRequestInput(
                email: $0.email,
                name: $0.name.isEmpty ? nil : $0.name,
                amount: Int(($0.amount ?? 0) * 100) // Convert to cents
            )
        }

        Task {
            do {
                let _: [PaymentRequest] = try await APIClient.shared.request(
                    .createPaymentRequests(
                        fundId: fundId,
                        accessCode: accessCode,
                        requests: requestInputs
                    )
                )

                await MainActor.run {
                    CaddyHaptics.success()
                    isSending = false
                    onComplete()
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    CaddyHaptics.error()
                    isSending = false
                    errorMessage = "Failed to send requests. Please try again."
                }
            }
        }
    }
}

// MARK: - New Payment Request Model
struct NewPaymentRequest {
    var email: String = ""
    var name: String = ""
    var amount: Double?
}

#Preview {
    AddRequestsSheet(fundId: "fund-1") {}
}
