import SwiftUI

struct ItineraryView: View {
    @State private var events: [ItineraryEvent] = ItineraryEvent.demoEvents

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    // Header
                    headerSection

                    // Timeline
                    timelineSection

                    // Motivational Footer
                    footerQuote
                }
            }
            .background(Color.gray50)
            .navigationTitle("Trip Itinerary")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(action: {}) {
                        Image(systemName: "airplane")
                            .foregroundColor(.forest)
                    }
                }
            }
        }
    }

    // MARK: - Header
    private var headerSection: some View {
        VStack(spacing: 8) {
            Text("Day 1 — Saturday")
                .font(.heading3)
                .foregroundColor(.gray900)

            Text("March 15, 2025")
                .font(.bodySmall)
                .foregroundColor(.gray500)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .background(Color.white)
    }

    // MARK: - Timeline
    private var timelineSection: some View {
        VStack(spacing: 0) {
            ForEach(Array(events.enumerated()), id: \.element.id) { index, event in
                TimelineEventRow(
                    event: event,
                    isFirst: index == 0,
                    isLast: index == events.count - 1
                )
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 24)
    }

    // MARK: - Footer Quote
    private var footerQuote: some View {
        VStack(spacing: 8) {
            Text("\"The most important shot in golf is the next one.\"")
                .font(.bodyMedium)
                .italic()
                .foregroundColor(.gray700)
                .multilineTextAlignment(.center)

            Text("— Ben Hogan")
                .font(.caption)
                .foregroundColor(.gray500)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
        .padding(.horizontal, 32)
        .background(Color.sand)
    }
}

// MARK: - Timeline Event Row
struct TimelineEventRow: View {
    let event: ItineraryEvent
    let isFirst: Bool
    let isLast: Bool

    private var dotColor: Color {
        switch event.type {
        case .golf:
            return .forest
        case .food, .social, .travel:
            return .gold
        }
    }

    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            // Timeline Column
            VStack(spacing: 0) {
                // Top Line
                Rectangle()
                    .fill(isFirst ? Color.clear : Color.gray300)
                    .frame(width: 2, height: 20)

                // Dot
                Circle()
                    .fill(dotColor)
                    .frame(width: 12, height: 12)
                    .overlay(
                        Circle()
                            .stroke(dotColor.opacity(0.3), lineWidth: 4)
                    )

                // Bottom Line
                Rectangle()
                    .fill(isLast ? Color.clear : Color.gray300)
                    .frame(width: 2)
                    .frame(maxHeight: .infinity)
            }
            .frame(width: 20)

            // Time Label
            Text(event.time)
                .font(.labelSmall)
                .foregroundColor(.gold)
                .frame(width: 70, alignment: .leading)

            // Event Card
            eventCard
        }
        .frame(minHeight: 100)
    }

    private var eventCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Title
            Text(event.title)
                .font(.heading4)
                .foregroundColor(.gray900)

            // Location
            HStack(spacing: 4) {
                Image(systemName: "mappin")
                    .font(.system(size: 12))
                    .foregroundColor(.gray400)

                Text(event.location)
                    .font(.bodySmall)
                    .foregroundColor(.gray600)
            }

            // Meta Info
            if let meta = event.meta {
                Text(meta)
                    .font(.caption)
                    .foregroundColor(.forest)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.forest.opacity(0.1))
                    .cornerRadius(4)
            }

            // Action Buttons for Golf Events
            if event.type == .golf {
                HStack(spacing: 12) {
                    Button(action: {}) {
                        HStack(spacing: 4) {
                            Image(systemName: "map")
                                .font(.system(size: 12))
                            Text("Course Guide")
                                .font(.caption)
                        }
                        .foregroundColor(.forest)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color.forest.opacity(0.1))
                        .cornerRadius(6)
                    }

                    Button(action: {}) {
                        HStack(spacing: 4) {
                            Image(systemName: "list.number")
                                .font(.system(size: 12))
                            Text("Scorecard")
                                .font(.caption)
                        }
                        .foregroundColor(.gold)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color.gold.opacity(0.1))
                        .cornerRadius(6)
                    }
                }
                .padding(.top, 4)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, y: 2)
    }
}

#Preview {
    ItineraryView()
}
