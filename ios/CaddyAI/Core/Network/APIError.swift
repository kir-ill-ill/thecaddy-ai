import Foundation

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(statusCode: Int, data: Data?)
    case decodingError
    case encodingError
    case networkError(Error)
    case serverError(code: String, message: String)
    case unauthorized
    case notFound
    case unknown

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .httpError(let statusCode, _):
            return "HTTP error: \(statusCode)"
        case .decodingError:
            return "Failed to decode response"
        case .encodingError:
            return "Failed to encode request"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .serverError(_, let message):
            return message
        case .unauthorized:
            return "Unauthorized. Please check your access code."
        case .notFound:
            return "Resource not found"
        case .unknown:
            return "An unknown error occurred"
        }
    }

    var isRetryable: Bool {
        switch self {
        case .networkError, .httpError(statusCode: 500...599, _):
            return true
        default:
            return false
        }
    }
}
