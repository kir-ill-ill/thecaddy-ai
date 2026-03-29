import Foundation

// MARK: - Trip Brief (User Input)
struct TripBrief: Codable, Equatable {
    var destination: String?
    var dates: TripDates?
    var groupSize: Int?
    var budget: TripBudget?
    var preferences: TripPreferences?
}

struct TripDates: Codable, Equatable {
    var startDate: String?
    var endDate: String?
    var flexibility: String? // "exact", "flexible", "very_flexible"
}

struct TripBudget: Codable, Equatable {
    var perPerson: Int? // in cents
    var total: Int?     // in cents
    var flexibility: String? // "strict", "flexible"
}

struct TripPreferences: Codable, Equatable {
    var courseTypes: [String]? // ["resort", "links", "parkland"]
    var lodgingTypes: [String]? // ["hotel", "airbnb", "resort"]
    var activities: [String]? // ["nightlife", "spa", "dining"]
}

// MARK: - Trip (Full saved trip)
struct Trip: Codable, Identifiable {
    let id: String
    let shareCode: String
    let tripName: String
    let creatorName: String
    let tripBrief: TripBrief?
    let selectedOptions: [String]
    let createdAt: String
}

// MARK: - Trip Option
struct TripOption: Codable, Identifiable {
    let id: String
    let title: String
    let destination: String
    let courses: [CourseInfo]
    let lodging: LodgingInfo
    let costEstimate: CostEstimate
    let whyItFits: [String]
    let highlights: [String]?
}

struct CourseInfo: Codable {
    let name: String
    let rating: Double?
    let greenFee: Int? // in cents
    let teeTime: String?
}

struct LodgingInfo: Codable {
    let name: String?
    let type: String
    let area: String
    let pricePerNight: Int? // in cents
}

struct CostEstimate: Codable {
    let perPersonEstimated: Int // in cents
    let breakdown: CostBreakdown?
}

struct CostBreakdown: Codable {
    let golf: Int?
    let lodging: Int?
    let travel: Int?
    let food: Int?
    let other: Int?
}

// MARK: - Trip with Votes
struct TripWithVotes: Codable {
    let trip: Trip
    let options: [TripOption]
    let votes: [VoteRecord]
    let results: [VoteResult]
}

struct VoteRecord: Codable {
    let voterName: String
    let votes: [String: Bool] // optionId -> yes/no
    let votedAt: String
}

struct VoteResult: Codable {
    let optionId: String
    let yesCount: Int
    let noCount: Int
    let totalVotes: Int
    let percentage: Double
}
