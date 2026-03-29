import Foundation

// MARK: - Vote Choice
enum VoteChoice: String, Codable {
    case yes
    case no
    case skip

    var color: String {
        switch self {
        case .yes: return "success"
        case .no: return "error"
        case .skip: return "gray"
        }
    }
}

// MARK: - User Vote
struct UserVote: Identifiable {
    let id: String // optionId
    let choice: VoteChoice
    let timestamp: Date

    init(optionId: String, choice: VoteChoice) {
        self.id = optionId
        self.choice = choice
        self.timestamp = Date()
    }
}

// MARK: - Vote Submission
struct VoteSubmission: Codable {
    let tripId: String
    let voterName: String
    let votes: [String: Bool] // optionId -> true (yes) / false (no)
}

// MARK: - Vote State
@Observable
class VoteState {
    var votes: [String: VoteChoice] = [:]
    var currentIndex: Int = 0
    var isComplete: Bool = false

    func vote(optionId: String, choice: VoteChoice) {
        votes[optionId] = choice
    }

    func getVote(for optionId: String) -> VoteChoice? {
        votes[optionId]
    }

    func toSubmissionFormat() -> [String: Bool] {
        votes.compactMapValues { choice in
            switch choice {
            case .yes: return true
            case .no: return false
            case .skip: return nil
            }
        }
    }

    func reset() {
        votes = [:]
        currentIndex = 0
        isComplete = false
    }
}
