import Foundation

// MARK: - Fund Types
enum FundType: String, Codable, CaseIterable {
    case dues = "dues"
    case shared = "shared"
    case both = "both"

    var displayName: String {
        switch self {
        case .dues: return "Per-Person Dues"
        case .shared: return "Shared Fund"
        case .both: return "Both"
        }
    }

    var description: String {
        switch self {
        case .dues: return "Each person owes a fixed amount"
        case .shared: return "Collect a total amount with flexible contributions"
        case .both: return "Set per-person dues and allow extra contributions"
        }
    }

    var icon: String {
        switch self {
        case .dues: return "person.2.fill"
        case .shared: return "banknote.fill"
        case .both: return "dollarsign.circle.fill"
        }
    }
}

// MARK: - Fund
struct Fund: Codable, Identifiable {
    let id: String
    let tripId: String
    let name: String
    let targetAmountPerPerson: Int?
    let targetTotal: Int?
    let fundType: String
    let description: String?
    let dueDate: String?
    let captainEmail: String
    let createdAt: String
    let updatedAt: String
}

// MARK: - Fund Summary
struct FundSummary: Codable {
    let fund: Fund
    let requests: [PaymentRequest]
    let payments: [Payment]
    let stats: FundStats
}

struct FundStats: Codable {
    let totalCollected: Int
    let totalPending: Int
    let paymentCount: Int
    let pendingRequestCount: Int
    let targetAmount: Int?
    let progressPercent: Int?
}

// MARK: - Payment
struct Payment: Codable, Identifiable {
    let id: String
    let fundId: String
    let tripId: String
    let payerEmail: String
    let payerName: String
    let amount: Int
    let paymentType: String
    let status: String
    let paidAt: String?
    let createdAt: String
}

// MARK: - Payment Request
struct PaymentRequest: Codable, Identifiable {
    let id: String
    let fundId: String
    let email: String
    let name: String?
    let amount: Int
    let requestCode: String
    let status: String
    let sentAt: String
    let paidAt: String?
}

// MARK: - Payment Request Input
struct PaymentRequestInput: Codable {
    let email: String
    let name: String?
    let amount: Int
}

// MARK: - Payment Request with Context
struct PaymentRequestWithContext: Codable {
    let id: String
    let email: String
    let name: String?
    let amount: Int
    let amountFormatted: String
    let requestCode: String
    let status: String
    let fund: FundInfo
    let tripName: String
}

struct FundInfo: Codable {
    let id: String
    let name: String
    let description: String?
    let fundType: String
}

// MARK: - Create Fund Response
struct CreateFundResponse: Codable {
    let fund: Fund
    let captainAccessCode: String
    let manageUrl: String
}

// MARK: - Checkout Response
struct CheckoutResponse: Codable {
    let checkoutUrl: String
    let sessionId: String
}
