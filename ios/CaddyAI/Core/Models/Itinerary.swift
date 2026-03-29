import Foundation

// MARK: - Itinerary Event
struct ItineraryEvent: Identifiable, Codable {
    let id: String
    let time: String
    let title: String
    let location: String
    let type: EventType
    let meta: String?

    enum EventType: String, Codable {
        case golf
        case food
        case social
        case travel
    }
}

// MARK: - Demo Data
extension ItineraryEvent {
    static let demoEvents: [ItineraryEvent] = [
        ItineraryEvent(
            id: "1",
            time: "08:00 AM",
            title: "Coffee & Bagels",
            location: "The House",
            type: .food,
            meta: nil
        ),
        ItineraryEvent(
            id: "2",
            time: "09:45 AM",
            title: "Tee Time: Troon North",
            location: "Monument Course",
            type: .golf,
            meta: "2-Man Scramble"
        ),
        ItineraryEvent(
            id: "3",
            time: "02:30 PM",
            title: "19th Hole Drinks",
            location: "Troon Clubhouse",
            type: .social,
            meta: nil
        ),
        ItineraryEvent(
            id: "4",
            time: "07:00 PM",
            title: "Steakhouse Dinner",
            location: "Mastro's City Hall",
            type: .food,
            meta: "Reservation Confirmed"
        ),
    ]
}
