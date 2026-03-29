import SwiftUI

// MARK: - Leaderboard Card (Reusable Component)
struct LeaderboardCard: View {
    let title: String
    let subtitle: String?
    let entries: [LeaderboardEntry]
    var showFullLeaderboard: Bool = false
    var onViewAll: (() -> Void)?

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.heading4)
                        .foregroundColor(.gray900)

                    if let subtitle = subtitle {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundColor(.gray500)
                    }
                }

                Spacer()

                if let onViewAll = onViewAll {
                    Button(action: onViewAll) {
                        Text("View All")
                            .font(.labelSmall)
                            .foregroundColor(.forest)
                    }
                }
            }
            .padding(16)
            .background(Color.white)

            Divider()

            // Leaderboard Entries
            VStack(spacing: 0) {
                ForEach(Array(entries.prefix(showFullLeaderboard ? entries.count : 5).enumerated()), id: \.element.id) { index, entry in
                    LeaderboardEntryRow(rank: index + 1, entry: entry)

                    if index < min(entries.count - 1, showFullLeaderboard ? entries.count - 1 : 4) {
                        Divider()
                            .padding(.leading, 56)
                    }
                }
            }
            .background(Color.white)
        }
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.08), radius: 8, y: 2)
    }
}

// MARK: - Leaderboard Entry Row (for LeaderboardCard)
struct LeaderboardEntryRow: View {
    let rank: Int
    let entry: LeaderboardEntry

    private var rankDisplay: some View {
        Group {
            switch rank {
            case 1:
                Image(systemName: "crown.fill")
                    .font(.system(size: 16))
                    .foregroundColor(.gold)
            case 2:
                Image(systemName: "medal.fill")
                    .font(.system(size: 14))
                    .foregroundColor(.gray400)
            case 3:
                Image(systemName: "medal.fill")
                    .font(.system(size: 14))
                    .foregroundColor(Color(red: 0.8, green: 0.5, blue: 0.2)) // Bronze
            default:
                Text("\(rank)")
                    .font(.labelMedium)
                    .foregroundColor(.gray400)
            }
        }
        .frame(width: 28)
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
            rankDisplay

            // Avatar
            ZStack {
                Circle()
                    .fill(entry.isCurrentUser ? Color.forest : Color.sand)
                    .frame(width: 40, height: 40)

                Text(entry.avatarInitials)
                    .font(.labelSmall)
                    .fontWeight(.bold)
                    .foregroundColor(entry.isCurrentUser ? .white : .forest)
            }
            .overlay(
                Circle()
                    .stroke(entry.isCurrentUser ? Color.forest : Color.forest.opacity(0.2), lineWidth: 2)
            )

            // Player Info
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.playerName)
                    .font(.labelMedium)
                    .foregroundColor(entry.isCurrentUser ? .forest : .gray900)

                Text("\(entry.holesCompleted) holes")
                    .font(.caption)
                    .foregroundColor(.gray500)
            }

            Spacer()

            // Score
            VStack(alignment: .trailing, spacing: 2) {
                Text("\(entry.score)")
                    .font(.heading3)
                    .foregroundColor(.gray900)

                Text(entry.parDifferenceDisplay)
                    .font(.labelSmall)
                    .fontWeight(.semibold)
                    .foregroundColor(parColor)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(entry.isCurrentUser ? Color.forest.opacity(0.05) : Color.clear)
    }
}

// MARK: - Compact Leaderboard (for smaller spaces)
struct CompactLeaderboard: View {
    let entries: [LeaderboardEntry]

    var body: some View {
        VStack(spacing: 8) {
            ForEach(Array(entries.prefix(3).enumerated()), id: \.element.id) { index, entry in
                HStack(spacing: 8) {
                    // Rank Medal
                    medalIcon(for: index + 1)
                        .frame(width: 20)

                    // Name
                    Text(entry.playerName)
                        .font(.labelSmall)
                        .foregroundColor(.gray700)
                        .lineLimit(1)

                    Spacer()

                    // Score
                    Text(entry.parDifferenceDisplay)
                        .font(.labelSmall)
                        .fontWeight(.bold)
                        .foregroundColor(entry.parDifference < 0 ? .forest : (entry.parDifference > 0 ? .error : .gray600))
                }
            }
        }
    }

    @ViewBuilder
    private func medalIcon(for rank: Int) -> some View {
        switch rank {
        case 1:
            Image(systemName: "crown.fill")
                .font(.system(size: 12))
                .foregroundColor(.gold)
        case 2:
            Text("2")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.gray500)
        case 3:
            Text("3")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.gray400)
        default:
            Text("\(rank)")
                .font(.caption)
                .foregroundColor(.gray400)
        }
    }
}

#Preview {
    VStack(spacing: 24) {
        LeaderboardCard(
            title: "Round 1 Standings",
            subtitle: "Troon North • Monument Course",
            entries: LeaderboardEntry.demoLeaderboard,
            onViewAll: {}
        )

        CaddyCard {
            VStack(alignment: .leading, spacing: 12) {
                Text("Quick Standings")
                    .font(.labelMedium)
                    .foregroundColor(.gray700)

                CompactLeaderboard(entries: LeaderboardEntry.demoLeaderboard)
            }
        }
    }
    .padding()
    .background(Color.gray50)
}
