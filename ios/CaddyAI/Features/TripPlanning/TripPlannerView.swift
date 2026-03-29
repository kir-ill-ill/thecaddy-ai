import SwiftUI

struct TripPlannerView: View {
    @State private var messages: [ChatMessage] = []
    @State private var inputText = ""
    @State private var isLoading = false
    @State private var tripBrief: TripBrief?
    @State private var generatedOptions: [TripOption] = []
    @State private var showOptions = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Chat Messages
                chatMessagesView

                // Options View (if generated)
                if showOptions && !generatedOptions.isEmpty {
                    optionsPreview
                }

                // Input Bar
                inputBar
            }
            .background(Color.gray50)
            .navigationTitle("Plan Your Trip")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    // MARK: - Chat Messages View
    private var chatMessagesView: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 16) {
                    // Welcome Message
                    if messages.isEmpty {
                        welcomeView
                    }

                    // Messages
                    ForEach(messages) { message in
                        ChatBubble(message: message)
                            .id(message.id)
                    }

                    // Typing Indicator
                    if isLoading {
                        HStack {
                            TypingIndicator()
                            Spacer()
                        }
                        .padding(.horizontal, 16)
                    }
                }
                .padding(.vertical, 16)
            }
            .onChange(of: messages.count) { _, _ in
                if let lastMessage = messages.last {
                    withAnimation {
                        proxy.scrollTo(lastMessage.id, anchor: .bottom)
                    }
                }
            }
        }
    }

    // MARK: - Welcome View
    private var welcomeView: some View {
        VStack(spacing: 24) {
            VStack(spacing: 12) {
                Image(systemName: "figure.golf")
                    .font(.system(size: 48))
                    .foregroundColor(.forest)

                Text("Start Planning Your Trip")
                    .font(.heading2)
                    .foregroundColor(.gray900)

                Text("Tell me about your ideal golf trip!")
                    .font(.bodyMedium)
                    .foregroundColor(.gray500)
            }
            .padding(.top, 40)

            // Example Prompts
            VStack(spacing: 12) {
                Text("Try saying:")
                    .font(.labelSmall)
                    .foregroundColor(.gray500)

                ForEach([
                    "Plan a golf trip to Scottsdale for 8 guys in May",
                    "Weekend golf trip for 4 people, $1200/person budget",
                    "Bachelor party golf trip in Florida next spring"
                ], id: \.self) { example in
                    Button {
                        inputText = example
                    } label: {
                        Text("\"\(example)\"")
                            .font(.bodySmall)
                            .foregroundColor(.gray700)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.white)
                            .cornerRadius(12)
                    }
                }
            }
            .padding(.horizontal, 24)
        }
    }

    // MARK: - Options Preview
    private var optionsPreview: some View {
        VStack(spacing: 12) {
            HStack {
                Text("\(generatedOptions.count) Options Generated")
                    .font(.labelMedium)
                    .foregroundColor(.gray700)

                Spacer()

                Button("View All") {
                    // Navigate to options
                }
                .font(.labelSmall)
                .foregroundColor(.forest)
            }
            .padding(.horizontal, 16)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(generatedOptions) { option in
                        optionCard(option)
                    }
                }
                .padding(.horizontal, 16)
            }
        }
        .padding(.vertical, 16)
        .background(Color.white)
    }

    private func optionCard(_ option: TripOption) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(option.title)
                .font(.labelMedium)
                .foregroundColor(.gray900)
                .lineLimit(1)

            Text(option.destination)
                .font(.bodySmall)
                .foregroundColor(.gray500)

            Text(formatCurrency(option.costEstimate.perPersonEstimated) + "/person")
                .font(.labelSmall)
                .foregroundColor(.forest)
        }
        .padding(12)
        .frame(width: 160)
        .background(Color.gray50)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.gray200, lineWidth: 1)
        )
    }

    // MARK: - Input Bar
    private var inputBar: some View {
        HStack(spacing: 12) {
            TextField("Tell me about your trip...", text: $inputText, axis: .vertical)
                .font(.bodyMedium)
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color.white)
                .cornerRadius(24)
                .overlay(
                    RoundedRectangle(cornerRadius: 24)
                        .stroke(Color.gray200, lineWidth: 1)
                )
                .lineLimit(4)

            Button {
                sendMessage()
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 36))
                    .foregroundColor(inputText.isEmpty ? .gray300 : .forest)
            }
            .disabled(inputText.isEmpty || isLoading)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color.white)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: -4)
    }

    // MARK: - Send Message
    private func sendMessage() {
        let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }

        // Add user message
        let userMessage = ChatMessage(role: .user, content: text)
        messages.append(userMessage)
        inputText = ""

        // Show loading
        isLoading = true

        // Simulate API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            isLoading = false

            // Add assistant response
            let response = ChatMessage(
                role: .assistant,
                content: "Great! I'm working on generating trip options for you based on your request. Give me just a moment..."
            )
            messages.append(response)

            // Simulate generating options
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                generatedOptions = [
                    TripOption(
                        id: "1",
                        title: "Scottsdale Classic",
                        destination: "Scottsdale, AZ",
                        courses: [
                            CourseInfo(name: "TPC Scottsdale", rating: 4.8, greenFee: 35000, teeTime: nil)
                        ],
                        lodging: LodgingInfo(name: "The Phoenician", type: "Resort", area: "Old Town", pricePerNight: 45000),
                        costEstimate: CostEstimate(perPersonEstimated: 125000, breakdown: nil),
                        whyItFits: ["Great weather", "Top courses"],
                        highlights: nil
                    )
                ]
                showOptions = true

                let optionsMessage = ChatMessage(
                    role: .assistant,
                    content: "I've generated \(generatedOptions.count) trip option(s) for you! Scroll up to see them, or tap 'View All' to explore in detail."
                )
                messages.append(optionsMessage)
            }
        }
    }

    // MARK: - Helpers
    private func formatCurrency(_ cents: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: Double(cents) / 100)) ?? "$0"
    }
}

// MARK: - Chat Message Model
struct ChatMessage: Identifiable {
    let id = UUID()
    let role: Role
    let content: String
    let timestamp = Date()

    enum Role {
        case user
        case assistant
    }
}

// MARK: - Chat Bubble
struct ChatBubble: View {
    let message: ChatMessage

    var body: some View {
        HStack {
            if message.role == .user {
                Spacer(minLength: 60)
            }

            Text(message.content)
                .font(.bodyMedium)
                .foregroundColor(message.role == .user ? .white : .gray900)
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(message.role == .user ? Color.forest : Color.gray100)
                .cornerRadius(20)

            if message.role == .assistant {
                Spacer(minLength: 60)
            }
        }
        .padding(.horizontal, 16)
    }
}

#Preview {
    TripPlannerView()
}
