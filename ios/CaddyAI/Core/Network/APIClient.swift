import Foundation

actor APIClient {
    static let shared = APIClient()

    // Configure your backend URL
    #if DEBUG
    private let baseURL = URL(string: "http://localhost:3001/api")!
    #else
    private let baseURL = URL(string: "https://your-app.vercel.app/api")!
    #endif

    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)

        self.decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601

        self.encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
    }

    // MARK: - Generic Request
    func request<T: Decodable>(_ endpoint: APIEndpoint) async throws -> T {
        let request = try buildRequest(for: endpoint)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard 200..<300 ~= httpResponse.statusCode else {
            throw APIError.httpError(statusCode: httpResponse.statusCode, data: data)
        }

        do {
            let apiResponse = try decoder.decode(APIResponse<T>.self, from: data)
            if apiResponse.success, let responseData = apiResponse.data {
                return responseData
            } else if let error = apiResponse.error {
                throw APIError.serverError(code: error.code, message: error.message)
            } else {
                throw APIError.decodingError
            }
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.decodingError
        }
    }

    // MARK: - Request without response data
    func requestVoid(_ endpoint: APIEndpoint) async throws {
        let request = try buildRequest(for: endpoint)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard 200..<300 ~= httpResponse.statusCode else {
            throw APIError.httpError(statusCode: httpResponse.statusCode, data: data)
        }
    }

    // MARK: - Build Request
    private func buildRequest(for endpoint: APIEndpoint) throws -> URLRequest {
        var urlComponents = URLComponents(url: baseURL.appendingPathComponent(endpoint.path), resolvingAgainstBaseURL: true)!

        // Add query parameters
        if !endpoint.queryItems.isEmpty {
            urlComponents.queryItems = endpoint.queryItems.map {
                URLQueryItem(name: $0.key, value: $0.value)
            }
        }

        guard let url = urlComponents.url else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        // Add body for POST/PATCH/PUT
        if let body = endpoint.body {
            request.httpBody = try encoder.encode(body)
        }

        return request
    }
}

// MARK: - API Response Wrapper
struct APIResponse<T: Decodable>: Decodable {
    let success: Bool
    let data: T?
    let error: APIErrorResponse?
}

struct APIErrorResponse: Decodable {
    let code: String
    let message: String
    let details: [String: String]?
}
