import SwiftUI

struct ScorecardView: View {
    @State private var leaderboard: [LeaderboardEntry] = LeaderboardEntry.currentRoundLeaderboard

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Trip Hero Card
                    tripHeroCard

                    // Agent Status Cards
                    agentStatusSection

                    // Commissioner Actions
                    commissionerActionsSection

                    // Finance Widget
                    financeWidget

                    // Leaderboard
                    leaderboardSection
                }
                .padding(.horizontal)
                .padding(.vertical, 16)
            }
            .background(Color.gray50)
            .navigationTitle("Scorecard")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    // MARK: - Trip Hero Card
    private var tripHeroCard: some View {
        ZStack(alignment: .bottomLeading) {
            // Background Gradient (simulating golf course image)
            LinearGradient(
                colors: [.forest, .forest.opacity(0.7)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            // Overlay Content
            VStack(alignment: .leading, spacing: 12) {
                Spacer()

                Text("Scottsdale Classic")
                    .font(.heading1)
                    .foregroundColor(.white)

                HStack(spacing: 4) {
                    Image(systemName: "mappin")
                        .font(.system(size: 14))
                    Text("Scottsdale, AZ")
                        .font(.bodyMedium)
                }
                .foregroundColor(.sand)

                // Stats Bar
                HStack(spacing: 24) {
                    HStack(spacing: 6) {
                        Image(systemName: "clock")
                            .font(.system(size: 14))
                        Text("3 Days Away")
                            .font(.labelSmall)
                    }
                    .foregroundColor(.gold)

                    HStack(spacing: 6) {
                        Image(systemName: "sun.max.fill")
                            .font(.system(size: 14))
                        Text("78°F Sunny")
                            .font(.labelSmall)
                    }
                    .foregroundColor(.gold)
                }
                .padding(.top, 8)
            }
            .padding(20)
        }
        .frame(height: 200)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.15), radius: 8, y: 4)
    }

    // MARK: - Agent Status Section
    private var agentStatusSection: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                agentStatusCard(
                    role: "The Treasurer",
                    icon: "dollarsign.circle.fill",
                    status: "Collecting deposits",
                    statusColor: .success
                )

                agentStatusCard(
                    role: "The Scout",
                    icon: "binoculars.fill",
                    status: "Scouting courses",
                    statusColor: .forest
                )
            }
        }
    }

    private func agentStatusCard(role: String, icon: String, status: String, statusColor: Color) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(.forest)

                Text(role)
                    .font(.labelMedium)
                    .foregroundColor(.gray900)
            }

            HStack(spacing: 6) {
                Circle()
                    .fill(statusColor)
                    .frame(width: 8, height: 8)

                Text(status)
                    .font(.caption)
                    .foregroundColor(.gray600)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, y: 2)
    }

    // MARK: - Commissioner Actions
    private var commissionerActionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Commissioner Actions")
                .font(.labelMedium)
                .foregroundColor(.gray700)
                .padding(.leading, 4)

            VStack(spacing: 8) {
                actionCard(
                    title: "3 Pending Payments",
                    subtitle: "Review and send reminders",
                    borderColor: .error,
                    buttonText: "Nudge All",
                    buttonColor: .error
                )

                actionCard(
                    title: "Course Vote Ending Soon",
                    subtitle: "2 members haven't voted yet",
                    borderColor: .gold,
                    buttonText: "Review",
                    buttonColor: .gold
                )
            }
        }
    }

    private func actionCard(title: String, subtitle: String, borderColor: Color, buttonText: String, buttonColor: Color) -> some View {
        HStack {
            Rectangle()
                .fill(borderColor)
                .frame(width: 4)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.labelMedium)
                    .foregroundColor(.gray900)

                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(.gray500)
            }
            .padding(.vertical, 12)

            Spacer()

            Button(action: {}) {
                Text(buttonText)
                    .font(.labelSmall)
                    .foregroundColor(buttonColor)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(buttonColor.opacity(0.1))
                    .cornerRadius(6)
            }
            .padding(.trailing, 12)
        }
        .background(Color.white)
        .cornerRadius(8)
        .shadow(color: .black.opacity(0.05), radius: 4, y: 2)
    }

    // MARK: - Finance Widget
    private var financeWidget: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Trip Fund")
                        .font(.labelMedium)
                        .foregroundColor(.sand.opacity(0.8))

                    Text("$2,450")
                        .font(.priceDisplay)
                        .foregroundColor(.white)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 4) {
                    Text("Goal")
                        .font(.caption)
                        .foregroundColor(.sand.opacity(0.6))

                    Text("$5,000")
                        .font(.labelMedium)
                        .foregroundColor(.gold)
                }
            }

            // Progress Bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.white.opacity(0.2))

                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.gold)
                        .frame(width: geometry.size.width * 0.49)
                }
            }
            .frame(height: 8)

            Text("49% collected • 9 of 12 paid")
                .font(.caption)
                .foregroundColor(.sand.opacity(0.7))
        }
        .padding(20)
        .background(
            LinearGradient(
                colors: [.forest, .forestDark],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(16)
    }

    // MARK: - Leaderboard Section
    private var leaderboardSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Current Round")
                    .font(.heading4)
                    .foregroundColor(.gray900)

                Spacer()

                Text("Front 9")
                    .font(.caption)
                    .foregroundColor(.gray500)
            }

            VStack(spacing: 0) {
                ForEach(Array(leaderboard.enumerated()), id: \.element.id) { index, entry in
                    LeaderboardRow(rank: index + 1, entry: entry)

                    if index < leaderboard.count - 1 {
                        Divider()
                            .padding(.leading, 48)
                    }
                }
            }
            .background(Color.white)
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.05), radius: 4, y: 2)
        }
    }
}

// MARK: - Leaderboard Row
struct LeaderboardRow: View {
    let rank: Int
    let entry: LeaderboardEntry

    private var rankColor: Color {
        switch rank {
        case 1: return .gold
        case 2, 3: return .gray400
        default: return .gray300
        }
    }

    private var parColor: Color {
        if entry.parDifference < 0 {
            return .forest
        } else if entry.parDifference > 0 {
            return .error
        } else {
            return .gray600
        }
    }

    var body: some View {
        HStack(spacing: 12) {
            // Rank
            ZStack {
                if rank == 1 {
                    Image(systemName: "crown.fill")
                        .font(.system(size: 14))
                        .foregroundColor(.gold)
                } else {
                    Text("#\(rank)")
                        .font(.labelSmall)
                        .foregroundColor(.gray400)
                }
            }
            .frame(width: 28)

            // Avatar
            ZStack {
                Circle()
                    .fill(entry.isCurrentUser ? Color.forest : Color.sand)
                    .frame(width: 36, height: 36)

                Text(entry.avatarInitials)
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(entry.isCurrentUser ? .white : .forest)
            }

            // Name
            Text(entry.playerName)
                .font(.labelMedium)
                .foregroundColor(entry.isCurrentUser ? .forest : .gray900)

            Spacer()

            // Score
            Text("\(entry.score)")
                .font(.heading4)
                .foregroundColor(.gray900)
                .frame(width: 40, alignment: .trailing)

            // Par Difference
            Text(entry.parDifferenceDisplay)
                .font(.labelSmall)
                .fontWeight(.semibold)
                .foregroundColor(parColor)
                .frame(width: 36, alignment: .trailing)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(entry.isCurrentUser ? Color.forest.opacity(0.05) : Color.clear)
    }
}

#Preview {
    ScorecardView()
}
