import Foundation

// MARK: - Roster Member
struct RosterMember: Identifiable, Codable {
    let id: String
    let name: String
    let handicap: Double
    let status: PaymentStatus
    let role: MemberRole
    var avatarInitials: String {
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return "\(parts[0].prefix(1))\(parts[1].prefix(1))"
        }
        return String(name.prefix(2)).uppercased()
    }

    enum PaymentStatus: String, Codable {
        case paid
        case pending
        case cancelled
    }

    enum MemberRole: String, Codable {
        case commissioner
        case player
    }
}

// MARK: - Demo Data
extension RosterMember {
    static let demoRoster: [RosterMember] = [
        RosterMember(id: "1", name: "Commish Dave", handicap: 8.2, status: .paid, role: .commissioner),
        RosterMember(id: "2", name: "Mike Ross", handicap: 12.5, status: .paid, role: .player),
        RosterMember(id: "3", name: "Harvey S.", handicap: 4.1, status: .paid, role: .player),
        RosterMember(id: "4", name: "Louis Litt", handicap: 18.0, status: .pending, role: .player),
        RosterMember(id: "5", name: "Donna P.", handicap: 15.3, status: .paid, role: .player),
        RosterMember(id: "6", name: "Rachel Z.", handicap: 22.1, status: .pending, role: .player),
        RosterMember(id: "7", name: "Alex W.", handicap: 9.4, status: .paid, role: .player),
        RosterMember(id: "8", name: "Samantha", handicap: 6.7, status: .paid, role: .player),
        RosterMember(id: "9", name: "Robert Z.", handicap: 10.1, status: .paid, role: .player),
        RosterMember(id: "10", name: "Katrina B.", handicap: 14.2, status: .pending, role: .player),
        RosterMember(id: "11", name: "Jessica P.", handicap: 11.8, status: .paid, role: .player),
        RosterMember(id: "12", name: "Jeff Malone", handicap: 5.5, status: .paid, role: .player),
    ]

    static let demoWaitlist: [RosterMember] = [
        RosterMember(id: "13", name: "Harold G.", handicap: 24.0, status: .pending, role: .player),
        RosterMember(id: "14", name: "Sheila S.", handicap: 19.5, status: .pending, role: .player),
    ]
}
