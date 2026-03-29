import SwiftUI

struct SwipeCardStack: View {
    let options: [TripOption]
    let onVote: (String, VoteChoice) -> Void
    let onComplete: () -> Void

    @State private var currentIndex = 0
    @State private var offset = CGSize.zero
    @State private var rotation: Double = 0

    private let swipeThreshold: CGFloat = 100

    var body: some View {
        ZStack {
            // Background cards (stacked)
            ForEach(visibleCards.reversed(), id: \.id) { option in
                let index = options.firstIndex(where: { $0.id == option.id }) ?? 0
                let isTop = index == currentIndex

                SwipeCardView(
                    option: option,
                    swipeProgress: isTop ? swipeProgress : 0
                )
                .offset(x: isTop ? offset.width : 0, y: isTop ? offset.height : CGFloat(index - currentIndex) * 8)
                .rotationEffect(.degrees(isTop ? rotation : 0))
                .scaleEffect(isTop ? 1.0 : 1.0 - CGFloat(index - currentIndex) * 0.02)
                .opacity(isTop ? 1.0 : 0.8)
                .zIndex(Double(options.count - index))
                .gesture(isTop ? dragGesture : nil)
            }

            // Empty state
            if currentIndex >= options.count {
                VStack(spacing: 16) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 64))
                        .foregroundColor(.forest)

                    Text("All done!")
                        .font(.heading2)
                        .foregroundColor(.gray900)

                    Text("You've reviewed all the options")
                        .font(.bodyMedium)
                        .foregroundColor(.gray500)
                }
            }
        }
        .padding(.horizontal, 16)
    }

    // MARK: - Visible Cards
    private var visibleCards: [TripOption] {
        let startIndex = currentIndex
        let endIndex = min(currentIndex + 3, options.count)
        guard startIndex < options.count else { return [] }
        return Array(options[startIndex..<endIndex])
    }

    // MARK: - Swipe Progress
    private var swipeProgress: CGFloat {
        offset.width / swipeThreshold
    }

    // MARK: - Drag Gesture
    private var dragGesture: some Gesture {
        DragGesture()
            .onChanged { gesture in
                offset = gesture.translation
                rotation = Double(gesture.translation.width / 20)
            }
            .onEnded { gesture in
                handleSwipeEnd(translation: gesture.translation, velocity: gesture.predictedEndTranslation)
            }
    }

    // MARK: - Handle Swipe End
    private func handleSwipeEnd(translation: CGSize, velocity: CGSize) {
        let horizontalAmount = translation.width
        let velocityAmount = velocity.width

        // Check if swipe is strong enough
        if horizontalAmount > swipeThreshold || velocityAmount > 500 {
            // Swipe right = YES
            CaddyHaptics.success()
            swipeAway(direction: .right)
        } else if horizontalAmount < -swipeThreshold || velocityAmount < -500 {
            // Swipe left = NO
            CaddyHaptics.medium()
            swipeAway(direction: .left)
        } else {
            // Snap back
            CaddyHaptics.light()
            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                offset = .zero
                rotation = 0
            }
        }
    }

    // MARK: - Swipe Away Animation
    private func swipeAway(direction: SwipeDirection) {
        let screenWidth = UIScreen.main.bounds.width

        withAnimation(.easeOut(duration: 0.3)) {
            offset = CGSize(
                width: direction == .right ? screenWidth * 1.5 : -screenWidth * 1.5,
                height: offset.height
            )
            rotation = direction == .right ? 15 : -15
        }

        // Record vote
        if currentIndex < options.count {
            let optionId = options[currentIndex].id
            let choice: VoteChoice = direction == .right ? .yes : .no
            onVote(optionId, choice)
        }

        // Move to next card
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            currentIndex += 1
            offset = .zero
            rotation = 0

            if currentIndex >= options.count {
                CaddyHaptics.success()
                onComplete()
            }
        }
    }

    enum SwipeDirection {
        case left, right
    }
}

// MARK: - Voting View
struct VotingView: View {
    @State private var options: [TripOption] = []
    @State private var voteState = VoteState()
    @State private var voterName = ""
    @State private var showNameInput = true
    @State private var showResults = false
    @State private var isLoading = false
    @State private var isSubmitting = false
    @State private var errorMessage: String?
    @State private var hasVoted = false

    private var appState: AppState { AppState.shared }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.gray50.ignoresSafeArea()

                if appState.currentTripId == nil {
                    noTripView
                } else if showNameInput {
                    nameInputView
                } else if showResults {
                    VoteResultsView(
                        tripId: appState.currentTripId ?? "",
                        voterName: voterName
                    )
                } else if options.isEmpty {
                    emptyStateView
                } else {
                    votingContentView
                }
            }
            .navigationTitle("Vote")
            .navigationBarTitleDisplayMode(.inline)
        }
        .onAppear {
            // Check if trip already has votes from this device
            if let trip = appState.currentTrip {
                options = trip.options
            }
        }
    }

    // MARK: - No Trip View
    private var noTripView: some View {
        EmptyStateView(
            type: .noVotes,
            actionTitle: nil,
            action: nil
        )
    }

    // MARK: - Name Input View
    private var nameInputView: some View {
        VStack(spacing: 24) {
            Spacer()

            VStack(spacing: 16) {
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 64))
                    .foregroundColor(.forest)

                Text("What's your name?")
                    .font(.heading2)
                    .foregroundColor(.gray900)

                Text("So we know who's voting")
                    .font(.bodyMedium)
                    .foregroundColor(.gray500)
            }

            CaddyTextField(
                placeholder: "Enter your name",
                text: $voterName,
                icon: "person"
            )
            .padding(.horizontal, 32)

            if let error = errorMessage {
                Text(error)
                    .font(.bodySmall)
                    .foregroundColor(.error)
                    .padding(.horizontal, 32)
            }

            CaddyButton(title: "Start Voting", action: {
                CaddyHaptics.light()
                withAnimation {
                    showNameInput = false
                }
                loadOptions()
            }, icon: "arrow.right")
            .padding(.horizontal, 32)
            .disabled(voterName.trimmingCharacters(in: .whitespaces).isEmpty)

            Spacer()
        }
    }

    // MARK: - Empty State View
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            if isLoading {
                LoadingSpinner(size: 48)
                Text("Loading options...")
                    .font(.bodyMedium)
                    .foregroundColor(.gray500)
            } else if let error = errorMessage {
                Image(systemName: "exclamationmark.triangle")
                    .font(.system(size: 48))
                    .foregroundColor(.error)

                Text("Failed to load")
                    .font(.heading3)
                    .foregroundColor(.gray700)

                Text(error)
                    .font(.bodyMedium)
                    .foregroundColor(.gray500)

                CaddyButton(title: "Try Again", action: {
                    loadOptions()
                }, style: .secondary, isFullWidth: false)
            } else {
                Image(systemName: "tray")
                    .font(.system(size: 48))
                    .foregroundColor(.gray400)

                Text("No options to vote on")
                    .font(.heading3)
                    .foregroundColor(.gray700)

                Text("The trip organizer hasn't added options yet")
                    .font(.bodyMedium)
                    .foregroundColor(.gray500)
            }
        }
    }

    // MARK: - Voting Content View
    private var votingContentView: some View {
        VStack(spacing: 24) {
            // Progress
            HStack {
                Text("\(min(voteState.currentIndex + 1, options.count)) of \(options.count)")
                    .font(.labelMedium)
                    .foregroundColor(.gray600)

                Spacer()

                Text(voterName)
                    .font(.bodySmall)
                    .foregroundColor(.gray500)
            }
            .padding(.horizontal, 20)

            // Card Stack
            SwipeCardStack(
                options: options,
                onVote: { optionId, choice in
                    voteState.vote(optionId: optionId, choice: choice)
                    voteState.currentIndex += 1
                },
                onComplete: {
                    submitVotes()
                }
            )

            // Action Buttons
            HStack(spacing: 40) {
                CircleActionButton(icon: "xmark", color: .error) {
                    // Trigger programmatic swipe left
                }

                CircleActionButton(icon: "heart.fill", color: .success) {
                    // Trigger programmatic swipe right
                }
            }
            .padding(.bottom, 24)

            if isSubmitting {
                HStack(spacing: 8) {
                    LoadingSpinner(size: 16)
                    Text("Submitting votes...")
                        .font(.bodySmall)
                        .foregroundColor(.gray500)
                }
            }
        }
    }

    // MARK: - Load Options
    private func loadOptions() {
        guard let tripId = appState.currentTripId ?? appState.currentShareCode else {
            errorMessage = "No trip selected"
            return
        }

        isLoading = true
        errorMessage = nil

        Task {
            do {
                let tripWithVotes: TripWithVotes = try await APIClient.shared.request(.getTrip(id: tripId))

                await MainActor.run {
                    appState.currentTrip = tripWithVotes
                    options = tripWithVotes.options
                    isLoading = false

                    // Check if user already voted
                    let alreadyVoted = tripWithVotes.votes.contains { $0.voterName.lowercased() == voterName.lowercased() }
                    if alreadyVoted {
                        hasVoted = true
                        showResults = true
                    }
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = "Failed to load trip options"
                }
            }
        }
    }

    // MARK: - Submit Votes
    private func submitVotes() {
        guard let tripId = appState.currentTripId else { return }

        isSubmitting = true

        Task {
            do {
                let votesDict = voteState.toSubmissionFormat()
                let _: TripWithVotes = try await APIClient.shared.request(
                    .submitVotes(tripId: tripId, votes: votesDict, voterName: voterName)
                )

                await MainActor.run {
                    CaddyHaptics.success()
                    isSubmitting = false
                    withAnimation {
                        showResults = true
                    }
                }
            } catch {
                await MainActor.run {
                    CaddyHaptics.error()
                    isSubmitting = false
                    errorMessage = "Failed to submit votes. Please try again."
                }
            }
        }
    }
}

#Preview {
    VotingView()
}
