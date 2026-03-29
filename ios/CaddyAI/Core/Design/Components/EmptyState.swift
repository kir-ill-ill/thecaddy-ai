import SwiftUI

// MARK: - Empty State Types
enum EmptyStateType {
    case noRoster
    case noVotes
    case noPayments
    case noItinerary
    case noTrips
    case noResults
    case error
    case offline

    var icon: String {
        switch self {
        case .noRoster: return "person.3"
        case .noVotes: return "hand.thumbsup"
        case .noPayments: return "dollarsign.circle"
        case .noItinerary: return "calendar.badge.clock"
        case .noTrips: return "map"
        case .noResults: return "magnifyingglass"
        case .error: return "exclamationmark.triangle"
        case .offline: return "wifi.slash"
        }
    }

    var title: String {
        switch self {
        case .noRoster: return "No Crew Yet"
        case .noVotes: return "No Votes to Cast"
        case .noPayments: return "No Payments Yet"
        case .noItinerary: return "No Events Planned"
        case .noTrips: return "No Trips Found"
        case .noResults: return "No Results"
        case .error: return "Something Went Wrong"
        case .offline: return "You're Offline"
        }
    }

    var subtitle: String {
        switch self {
        case .noRoster: return "Start building your golf crew by inviting members to join the trip."
        case .noVotes: return "When your commissioner creates a vote, you'll be able to swipe through options here."
        case .noPayments: return "Payment requests will appear here once your commissioner sends them out."
        case .noItinerary: return "Your trip timeline will appear here once events are scheduled."
        case .noTrips: return "Create a new trip to get started planning your next golf adventure."
        case .noResults: return "Try adjusting your search or filters to find what you're looking for."
        case .error: return "We couldn't load the content. Please try again."
        case .offline: return "Check your internet connection and try again."
        }
    }

    var accentColor: Color {
        switch self {
        case .error, .offline: return .error
        default: return .forest
        }
    }
}

// MARK: - Empty State View
struct EmptyStateView: View {
    let type: EmptyStateType
    var actionTitle: String?
    var action: (() -> Void)?

    @State private var isAnimating = false

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Animated Icon
            ZStack {
                Circle()
                    .fill(type.accentColor.opacity(0.08))
                    .frame(width: 140, height: 140)
                    .scaleEffect(isAnimating ? 1.1 : 1.0)

                Circle()
                    .fill(type.accentColor.opacity(0.15))
                    .frame(width: 100, height: 100)

                Image(systemName: type.icon)
                    .font(.system(size: 44))
                    .foregroundColor(type.accentColor)
                    .offset(y: isAnimating ? -4 : 0)
            }
            .animation(
                .easeInOut(duration: 2.0).repeatForever(autoreverses: true),
                value: isAnimating
            )

            // Text Content
            VStack(spacing: 12) {
                Text(type.title)
                    .font(.heading2)
                    .foregroundColor(.gray900)
                    .multilineTextAlignment(.center)

                Text(type.subtitle)
                    .font(.bodyMedium)
                    .foregroundColor(.gray500)
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
            }
            .padding(.horizontal, 32)

            // Action Button
            if let actionTitle = actionTitle, let action = action {
                Button(action: {
                    CaddyHaptics.light()
                    action()
                }) {
                    HStack(spacing: 8) {
                        Text(actionTitle)
                            .font(.labelMedium)

                        Image(systemName: "arrow.right")
                            .font(.system(size: 12, weight: .semibold))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 14)
                    .background(type.accentColor)
                    .cornerRadius(10)
                }
                .padding(.top, 8)
            }

            Spacer()
            Spacer()
        }
        .onAppear {
            isAnimating = true
        }
    }
}

// MARK: - Inline Empty State (for smaller spaces)
struct InlineEmptyState: View {
    let icon: String
    let message: String
    var actionTitle: String?
    var action: (() -> Void)?

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 32))
                .foregroundColor(.gray400)

            Text(message)
                .font(.bodyMedium)
                .foregroundColor(.gray500)
                .multilineTextAlignment(.center)

            if let actionTitle = actionTitle, let action = action {
                Button(action: action) {
                    Text(actionTitle)
                        .font(.labelSmall)
                        .foregroundColor(.forest)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
        .padding(.horizontal, 24)
    }
}

#Preview {
    ScrollView {
        VStack(spacing: 40) {
            EmptyStateView(
                type: .noRoster,
                actionTitle: "Invite Members",
                action: {}
            )
            .frame(height: 400)

            Divider()

            EmptyStateView(
                type: .error,
                actionTitle: "Try Again",
                action: {}
            )
            .frame(height: 400)

            Divider()

            CaddyCard {
                InlineEmptyState(
                    icon: "envelope.badge",
                    message: "No payment requests yet",
                    actionTitle: "Send First Request",
                    action: {}
                )
            }
            .padding(.horizontal)
        }
    }
    .background(Color.gray50)
}
