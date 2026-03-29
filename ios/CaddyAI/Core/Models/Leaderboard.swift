import Foundation

// MARK: - Leaderboard Entry
struct LeaderboardEntry: Identifiable, Codable {
    let id: String
    let playerName: String
    let score: Int
    let parDifference: Int  // negative = under par, positive = over par
    let holesCompleted: Int
    let isCurrentUser: Bool

    var parDifferenceDisplay: String {
        if parDifference == 0 {
            return "E"
        } else if parDifference > 0 {
            return "+\(parDifference)"
        } else {
            return "\(parDifference)"
        }
    }

    var avatarInitials: String {
        let parts = playerName.split(separator: " ")
        if parts.count >= 2 {
            return "\(parts[0].prefix(1))\(parts[1].prefix(1))"
        }
        return String(playerName.prefix(2)).uppercased()
    }
}

// MARK: - Demo Data
extension LeaderboardEntry {
    static let demoLeaderboard: [LeaderboardEntry] = [
        LeaderboardEntry(id: "1", playerName: "Harvey S.", score: 68, parDifference: -4, holesCompleted: 18, isCurrentUser: false),
        LeaderboardEntry(id: "2", playerName: "Jeff Malone", score: 70, parDifference: -2, holesCompleted: 18, isCurrentUser: false),
        LeaderboardEntry(id: "3", playerName: "Commish Dave", score: 72, parDifference: 0, holesCompleted: 18, isCurrentUser: true),
        LeaderboardEntry(id: "4", playerName: "Samantha", score: 74, parDifference: 2, holesCompleted: 18, isCurrentUser: false),
        LeaderboardEntry(id: "5", playerName: "Alex W.", score: 75, parDifference: 3, holesCompleted: 18, isCurrentUser: false),
        LeaderboardEntry(id: "6", playerName: "Mike Ross", score: 78, parDifference: 6, holesCompleted: 18, isCurrentUser: false),
    ]

    static let currentRoundLeaderboard: [LeaderboardEntry] = [
        LeaderboardEntry(id: "1", playerName: "Samantha", score: 34, parDifference: -2, holesCompleted: 9, isCurrentUser: false),
        LeaderboardEntry(id: "2", playerName: "Harvey S.", score: 35, parDifference: -1, holesCompleted: 9, isCurrentUser: false),
        LeaderboardEntry(id: "3", playerName: "Commish Dave", score: 36, parDifference: 0, holesCompleted: 9, isCurrentUser: true),
        LeaderboardEntry(id: "4", playerName: "Alex W.", score: 38, parDifference: 2, holesCompleted: 9, isCurrentUser: false),
    ]
}
