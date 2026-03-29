import SwiftUI

/// Global app state manager for trip context and navigation
@Observable
final class AppState {
    static let shared = AppState()

    // MARK: - Trip Context
    var currentTripId: String?
    var currentShareCode: String?
    var currentTrip: TripWithVotes?

    // MARK: - Fund Context
    var currentFundId: String?
    var captainAccessCode: String?

    // MARK: - Navigation
    var showTripEntry = true
    var pendingPaymentCode: String?
    var activeTab: ContentTab = .scorecard

    // MARK: - Persistence Keys
    private let tripIdKey = "currentTripId"
    private let shareCodeKey = "currentShareCode"
    private let fundIdKey = "currentFundId"
    private let accessCodeKey = "captainAccessCode"

    private init() {
        // Load persisted state
        currentTripId = UserDefaults.standard.string(forKey: tripIdKey)
        currentShareCode = UserDefaults.standard.string(forKey: shareCodeKey)
        currentFundId = UserDefaults.standard.string(forKey: fundIdKey)
        captainAccessCode = UserDefaults.standard.string(forKey: accessCodeKey)

        // Show entry if no trip is stored
        showTripEntry = currentTripId == nil
    }

    // MARK: - Set Trip
    func setTrip(id: String, shareCode: String) {
        currentTripId = id
        currentShareCode = shareCode
        showTripEntry = false

        // Persist
        UserDefaults.standard.set(id, forKey: tripIdKey)
        UserDefaults.standard.set(shareCode, forKey: shareCodeKey)
    }

    // MARK: - Set Fund Access
    func setFundAccess(fundId: String, accessCode: String) {
        currentFundId = fundId
        captainAccessCode = accessCode

        // Persist
        UserDefaults.standard.set(fundId, forKey: fundIdKey)
        UserDefaults.standard.set(accessCode, forKey: accessCodeKey)
    }

    // MARK: - Clear Trip
    func clearTrip() {
        currentTripId = nil
        currentShareCode = nil
        currentTrip = nil
        currentFundId = nil
        captainAccessCode = nil
        showTripEntry = true

        // Clear persisted
        UserDefaults.standard.removeObject(forKey: tripIdKey)
        UserDefaults.standard.removeObject(forKey: shareCodeKey)
        UserDefaults.standard.removeObject(forKey: fundIdKey)
        UserDefaults.standard.removeObject(forKey: accessCodeKey)
    }

    // MARK: - Handle Deep Link
    func handleDeepLink(_ url: URL) {
        // caddy://trip/{shareCode}
        // caddy://pay/{requestCode}
        guard let scheme = url.scheme, scheme == "caddy" else { return }

        let pathComponents = url.pathComponents.filter { $0 != "/" }
        guard let action = pathComponents.first else { return }

        switch action {
        case "trip":
            if pathComponents.count > 1 {
                let shareCode = pathComponents[1]
                loadTripByShareCode(shareCode)
            }
        case "pay":
            if pathComponents.count > 1 {
                pendingPaymentCode = pathComponents[1]
            }
        default:
            break
        }
    }

    // MARK: - Load Trip by Share Code
    func loadTripByShareCode(_ shareCode: String) {
        Task {
            do {
                let tripWithVotes: TripWithVotes = try await APIClient.shared.request(.getTrip(id: shareCode))
                await MainActor.run {
                    self.currentTrip = tripWithVotes
                    self.setTrip(id: tripWithVotes.trip.id, shareCode: tripWithVotes.trip.shareCode)
                }
            } catch {
                print("Failed to load trip: \(error)")
            }
        }
    }
}

// MARK: - Tab Enum
enum ContentTab: Hashable {
    case scorecard
    case roster
    case vote
    case itinerary
}
