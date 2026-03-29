import SwiftUI

struct TripEntryView: View {
    @State private var shareCode = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showCreateTrip = false

    let onTripLoaded: () -> Void

    var body: some View {
        ZStack {
            Color.gray50.ignoresSafeArea()

            VStack(spacing: 32) {
                Spacer()

                // Header
                VStack(spacing: 16) {
                    ZStack {
                        Circle()
                            .fill(Color.forest.opacity(0.1))
                            .frame(width: 120, height: 120)

                        Image(systemName: "link.circle.fill")
                            .font(.system(size: 56))
                            .foregroundColor(.forest)
                    }

                    Text("Join a Trip")
                        .font(.heading1)
                        .foregroundColor(.gray900)

                    Text("Enter your trip's share code to access voting, payments, and more")
                        .font(.bodyMedium)
                        .foregroundColor(.gray500)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                }

                // Share Code Input
                VStack(spacing: 16) {
                    CaddyTextField(
                        placeholder: "Share code (e.g., abc123)",
                        text: $shareCode,
                        icon: "link"
                    )
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()

                    if let error = errorMessage {
                        HStack(spacing: 8) {
                            Image(systemName: "exclamationmark.circle.fill")
                            Text(error)
                        }
                        .font(.bodySmall)
                        .foregroundColor(.error)
                    }

                    CaddyButton(
                        title: "Join Trip",
                        action: loadTrip,
                        icon: "arrow.right",
                        isLoading: isLoading
                    )
                    .disabled(shareCode.trimmingCharacters(in: .whitespaces).isEmpty)
                }
                .padding(.horizontal, 24)

                // Divider
                HStack {
                    Rectangle()
                        .fill(Color.gray300)
                        .frame(height: 1)

                    Text("or")
                        .font(.bodySmall)
                        .foregroundColor(.gray500)
                        .padding(.horizontal, 16)

                    Rectangle()
                        .fill(Color.gray300)
                        .frame(height: 1)
                }
                .padding(.horizontal, 32)

                // Create Trip Option
                VStack(spacing: 12) {
                    Text("Planning a new trip?")
                        .font(.bodyMedium)
                        .foregroundColor(.gray600)

                    CaddyButton(
                        title: "Start Planning",
                        action: { showCreateTrip = true },
                        style: .secondary,
                        icon: "plus.circle"
                    )
                }
                .padding(.horizontal, 24)

                Spacer()
                Spacer()
            }
        }
        .sheet(isPresented: $showCreateTrip) {
            NavigationStack {
                TripPlannerView()
                    .toolbar {
                        ToolbarItem(placement: .topBarLeading) {
                            Button("Close") {
                                showCreateTrip = false
                            }
                        }
                    }
            }
        }
    }

    private func loadTrip() {
        guard !shareCode.trimmingCharacters(in: .whitespaces).isEmpty else { return }

        isLoading = true
        errorMessage = nil
        CaddyHaptics.light()

        Task {
            do {
                let tripWithVotes: TripWithVotes = try await APIClient.shared.request(.getTrip(id: shareCode.trimmingCharacters(in: .whitespaces)))

                await MainActor.run {
                    CaddyHaptics.success()
                    AppState.shared.currentTrip = tripWithVotes
                    AppState.shared.setTrip(id: tripWithVotes.trip.id, shareCode: tripWithVotes.trip.shareCode)
                    isLoading = false
                    onTripLoaded()
                }
            } catch let error as APIError {
                await MainActor.run {
                    CaddyHaptics.error()
                    isLoading = false
                    switch error {
                    case .notFound, .httpError(statusCode: 404, _):
                        errorMessage = "Trip not found. Check your share code."
                    case .networkError:
                        errorMessage = "Network error. Check your connection."
                    default:
                        errorMessage = error.localizedDescription
                    }
                }
            } catch {
                await MainActor.run {
                    CaddyHaptics.error()
                    isLoading = false
                    errorMessage = "Failed to load trip. Please try again."
                }
            }
        }
    }
}

#Preview {
    TripEntryView(onTripLoaded: {})
}
