import Foundation

struct APIEndpoint {
    let path: String
    let method: HTTPMethod
    var queryItems: [String: String] = [:]
    var body: Encodable?

    enum HTTPMethod: String {
        case GET
        case POST
        case PATCH
        case PUT
        case DELETE
    }
}

// MARK: - Trip Endpoints
extension APIEndpoint {
    static func createTrip(
        tripBrief: TripBrief,
        options: [TripOption],
        selectedOptions: [String],
        creatorName: String
    ) -> APIEndpoint {
        struct Body: Encodable {
            let tripBrief: TripBrief
            let options: [TripOption]
            let selectedOptions: [String]
            let creatorName: String
        }

        return APIEndpoint(
            path: "trips",
            method: .POST,
            body: Body(
                tripBrief: tripBrief,
                options: options,
                selectedOptions: selectedOptions,
                creatorName: creatorName
            )
        )
    }

    static func getTrip(id: String) -> APIEndpoint {
        APIEndpoint(path: "trips/\(id)", method: .GET)
    }

    static func submitVotes(tripId: String, votes: [String: Bool], voterName: String) -> APIEndpoint {
        struct Body: Encodable {
            let votes: [String: Bool]
            let voterName: String
        }

        return APIEndpoint(
            path: "trips/\(tripId)/vote",
            method: .POST,
            body: Body(votes: votes, voterName: voterName)
        )
    }
}

// MARK: - Fund Endpoints
extension APIEndpoint {
    static func createFund(
        tripId: String,
        name: String,
        fundType: String,
        targetAmountPerPerson: Int?,
        targetTotal: Int?,
        captainEmail: String,
        description: String? = nil,
        dueDate: String? = nil
    ) -> APIEndpoint {
        struct Body: Encodable {
            let tripId: String
            let name: String
            let fundType: String
            let targetAmountPerPerson: Int?
            let targetTotal: Int?
            let captainEmail: String
            let description: String?
            let dueDate: String?
        }

        return APIEndpoint(
            path: "funds",
            method: .POST,
            body: Body(
                tripId: tripId,
                name: name,
                fundType: fundType,
                targetAmountPerPerson: targetAmountPerPerson,
                targetTotal: targetTotal,
                captainEmail: captainEmail,
                description: description,
                dueDate: dueDate
            )
        )
    }

    static func getFund(fundId: String, accessCode: String) -> APIEndpoint {
        APIEndpoint(
            path: "funds/\(fundId)",
            method: .GET,
            queryItems: ["code": accessCode]
        )
    }

    static func getFundByTrip(tripId: String, accessCode: String) -> APIEndpoint {
        APIEndpoint(
            path: "funds/by-trip/\(tripId)",
            method: .GET,
            queryItems: ["code": accessCode]
        )
    }

    static func createPaymentRequests(
        fundId: String,
        accessCode: String,
        requests: [PaymentRequestInput]
    ) -> APIEndpoint {
        struct Body: Encodable {
            let accessCode: String
            let requests: [PaymentRequestInput]
        }

        return APIEndpoint(
            path: "funds/\(fundId)/requests",
            method: .POST,
            body: Body(accessCode: accessCode, requests: requests)
        )
    }
}

// MARK: - Payment Endpoints
extension APIEndpoint {
    static func getPaymentRequest(requestCode: String) -> APIEndpoint {
        APIEndpoint(path: "payments/\(requestCode)", method: .GET)
    }

    static func createCheckout(
        requestCode: String,
        payerName: String,
        payerEmail: String
    ) -> APIEndpoint {
        struct Body: Encodable {
            let requestCode: String
            let payerName: String
            let payerEmail: String
        }

        return APIEndpoint(
            path: "payments/checkout",
            method: .POST,
            body: Body(
                requestCode: requestCode,
                payerName: payerName,
                payerEmail: payerEmail
            )
        )
    }
}

// MARK: - Extract Endpoint
extension APIEndpoint {
    static func extractTripDetails(
        userMessage: String,
        chatContext: TripBrief?
    ) -> APIEndpoint {
        struct Body: Encodable {
            let schemaVersion: String
            let userMessage: String
            let chatContext: TripBrief?
            let locale: String
            let nowDate: String
        }

        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"

        return APIEndpoint(
            path: "extract",
            method: .POST,
            body: Body(
                schemaVersion: "1.0",
                userMessage: userMessage,
                chatContext: chatContext,
                locale: "en-US",
                nowDate: dateFormatter.string(from: Date())
            )
        )
    }
}
