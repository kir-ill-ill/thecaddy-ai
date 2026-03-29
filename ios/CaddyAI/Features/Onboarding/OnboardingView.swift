import SwiftUI

// MARK: - Onboarding Page Model
struct OnboardingPage: Identifiable {
    let id = UUID()
    let icon: String
    let title: String
    let subtitle: String
    let accentColor: Color
}

// MARK: - Onboarding View
struct OnboardingView: View {
    @Binding var hasCompletedOnboarding: Bool
    @State private var currentPage = 0

    private let pages: [OnboardingPage] = [
        OnboardingPage(
            icon: "person.3.fill",
            title: "Rally Your Crew",
            subtitle: "Invite your golf buddies, manage the roster, and track who's in. No more group text chaos.",
            accentColor: .forest
        ),
        OnboardingPage(
            icon: "hand.thumbsup.fill",
            title: "Vote on Destinations",
            subtitle: "Swipe through curated trip options. Everyone votes, the best trip wins.",
            accentColor: .gold
        ),
        OnboardingPage(
            icon: "dollarsign.circle.fill",
            title: "Collect Payments",
            subtitle: "Send payment requests, track who's paid, and nudge the stragglers. Treasury made simple.",
            accentColor: .forest
        ),
        OnboardingPage(
            icon: "calendar.badge.clock",
            title: "Plan Every Detail",
            subtitle: "From tee times to dinner reservations, your entire trip timeline in one place.",
            accentColor: .gold
        )
    ]

    var body: some View {
        ZStack {
            // Background
            Color.gray50.ignoresSafeArea()

            VStack(spacing: 0) {
                // Skip Button
                HStack {
                    Spacer()
                    Button("Skip") {
                        completeOnboarding()
                    }
                    .font(.labelMedium)
                    .foregroundColor(.gray500)
                    .padding(.horizontal, 24)
                    .padding(.top, 16)
                }

                // Page Content
                TabView(selection: $currentPage) {
                    ForEach(Array(pages.enumerated()), id: \.element.id) { index, page in
                        OnboardingPageView(page: page)
                            .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.easeInOut, value: currentPage)

                // Custom Page Indicator
                HStack(spacing: 8) {
                    ForEach(0..<pages.count, id: \.self) { index in
                        Capsule()
                            .fill(index == currentPage ? Color.forest : Color.gray300)
                            .frame(width: index == currentPage ? 24 : 8, height: 8)
                            .animation(.spring(response: 0.3), value: currentPage)
                    }
                }
                .padding(.bottom, 32)

                // Action Button
                Button(action: {
                    if currentPage < pages.count - 1 {
                        withAnimation {
                            currentPage += 1
                        }
                        generateHapticFeedback(.light)
                    } else {
                        completeOnboarding()
                    }
                }) {
                    HStack(spacing: 8) {
                        Text(currentPage < pages.count - 1 ? "Continue" : "Get Started")
                            .font(.labelLarge)

                        Image(systemName: currentPage < pages.count - 1 ? "arrow.right" : "checkmark")
                            .font(.system(size: 14, weight: .semibold))
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Color.forest)
                    .cornerRadius(12)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 48)
            }
        }
    }

    private func completeOnboarding() {
        generateHapticFeedback(.medium)
        withAnimation(.easeInOut(duration: 0.3)) {
            hasCompletedOnboarding = true
        }
    }

    private func generateHapticFeedback(_ style: UIImpactFeedbackGenerator.FeedbackStyle) {
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.impactOccurred()
    }
}

// MARK: - Onboarding Page View
struct OnboardingPageView: View {
    let page: OnboardingPage
    @State private var isAnimating = false

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Icon with animated background
            ZStack {
                Circle()
                    .fill(page.accentColor.opacity(0.15))
                    .frame(width: 160, height: 160)
                    .scaleEffect(isAnimating ? 1.0 : 0.9)

                Circle()
                    .fill(page.accentColor.opacity(0.08))
                    .frame(width: 200, height: 200)
                    .scaleEffect(isAnimating ? 1.05 : 0.95)

                Image(systemName: page.icon)
                    .font(.system(size: 64))
                    .foregroundColor(page.accentColor)
                    .scaleEffect(isAnimating ? 1.0 : 0.8)
            }
            .animation(
                .easeInOut(duration: 1.5).repeatForever(autoreverses: true),
                value: isAnimating
            )

            // Text Content
            VStack(spacing: 16) {
                Text(page.title)
                    .font(.heading1)
                    .foregroundColor(.gray900)
                    .multilineTextAlignment(.center)

                Text(page.subtitle)
                    .font(.bodyMedium)
                    .foregroundColor(.gray600)
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
                    .padding(.horizontal, 24)
            }

            Spacer()
            Spacer()
        }
        .padding(.horizontal, 24)
        .onAppear {
            isAnimating = true
        }
    }
}

#Preview {
    OnboardingView(hasCompletedOnboarding: .constant(false))
}
