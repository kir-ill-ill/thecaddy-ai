import SwiftUI

struct SwipeCardView: View {
    let option: TripOption
    var swipeProgress: CGFloat = 0 // -1 to 1

    var body: some View {
        ZStack {
            // Card Content
            VStack(spacing: 0) {
                // Header with gradient
                headerSection

                // Content
                ScrollView {
                    VStack(spacing: 16) {
                        // Price Badge
                        priceBadge
                            .offset(y: -20)

                        // Courses
                        coursesSection
                            .padding(.top, -8)

                        // Lodging
                        lodgingSection

                        // Why It Fits
                        whyItFitsSection
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 24)
                }
                .background(Color.white)
            }
            .cornerRadius(24)
            .shadow(color: .black.opacity(0.15), radius: 20, x: 0, y: 10)

            // Swipe Overlay
            swipeOverlay
        }
    }

    // MARK: - Header Section
    private var headerSection: some View {
        VStack(spacing: 8) {
            Text(option.title)
                .font(.heading2)
                .foregroundColor(.white)
                .multilineTextAlignment(.center)

            HStack(spacing: 4) {
                Image(systemName: "mappin.circle.fill")
                Text(option.destination)
            }
            .font(.bodyMedium)
            .foregroundColor(.white.opacity(0.9))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
        .padding(.horizontal, 20)
        .background(
            LinearGradient(
                colors: [.forest, .forestDark],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }

    // MARK: - Price Badge
    private var priceBadge: some View {
        VStack(spacing: 2) {
            Text(formatCurrency(option.costEstimate.perPersonEstimated))
                .font(.priceSmall)
                .foregroundColor(.forest)

            Text("per person")
                .font(.caption)
                .foregroundColor(.gray500)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.forest.opacity(0.3), lineWidth: 2)
        )
        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
    }

    // MARK: - Courses Section
    private var coursesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Courses", systemImage: "flag.fill")
                .font(.labelMedium)
                .foregroundColor(.gray700)

            VStack(spacing: 8) {
                ForEach(option.courses.indices, id: \.self) { index in
                    HStack(spacing: 12) {
                        Image(systemName: "circle.fill")
                            .font(.system(size: 6))
                            .foregroundColor(.forest)

                        Text(option.courses[index].name)
                            .font(.bodyMedium)
                            .foregroundColor(.gray700)

                        Spacer()

                        if let rating = option.courses[index].rating {
                            HStack(spacing: 2) {
                                Image(systemName: "star.fill")
                                    .foregroundColor(.gold)
                                    .font(.system(size: 10))
                                Text(String(format: "%.1f", rating))
                                    .font(.bodySmall)
                                    .foregroundColor(.gray500)
                            }
                        }
                    }
                    .padding(.vertical, 8)
                    .padding(.horizontal, 12)
                    .background(Color.gray50)
                    .cornerRadius(8)
                }
            }
        }
    }

    // MARK: - Lodging Section
    private var lodgingSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Lodging", systemImage: "bed.double.fill")
                .font(.labelMedium)
                .foregroundColor(.gray700)

            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(option.lodging.name ?? option.lodging.type.capitalized)
                        .font(.bodyMedium)
                        .foregroundColor(.gray700)

                    Text(option.lodging.area)
                        .font(.bodySmall)
                        .foregroundColor(.gray500)
                }

                Spacer()

                if let price = option.lodging.pricePerNight {
                    Text("\(formatCurrency(price))/night")
                        .font(.labelSmall)
                        .foregroundColor(.forest)
                }
            }
            .padding(12)
            .background(Color.gray50)
            .cornerRadius(8)
        }
    }

    // MARK: - Why It Fits Section
    private var whyItFitsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Why This Works", systemImage: "checkmark.seal.fill")
                .font(.labelMedium)
                .foregroundColor(.gray700)

            FlowLayout(spacing: 8) {
                ForEach(option.whyItFits, id: \.self) { reason in
                    Text(reason)
                        .font(.labelSmall)
                        .foregroundColor(.forestDark)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.forestLight)
                        .cornerRadius(16)
                }
            }
        }
    }

    // MARK: - Swipe Overlay
    @ViewBuilder
    private var swipeOverlay: some View {
        if abs(swipeProgress) > 0.1 {
            ZStack {
                // YES overlay
                if swipeProgress > 0 {
                    yesOverlay
                        .opacity(Double(swipeProgress))
                }

                // NOPE overlay
                if swipeProgress < 0 {
                    nopeOverlay
                        .opacity(Double(abs(swipeProgress)))
                }
            }
        }
    }

    private var yesOverlay: some View {
        VStack {
            HStack {
                Text("YES")
                    .font(.system(size: 48, weight: .black))
                    .foregroundColor(.success)
                    .padding(16)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color.success, lineWidth: 4)
                    )
                    .rotationEffect(.degrees(-15))

                Spacer()
            }
            .padding(24)

            Spacer()
        }
    }

    private var nopeOverlay: some View {
        VStack {
            HStack {
                Spacer()

                Text("NOPE")
                    .font(.system(size: 48, weight: .black))
                    .foregroundColor(.error)
                    .padding(16)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color.error, lineWidth: 4)
                    )
                    .rotationEffect(.degrees(15))
            }
            .padding(24)

            Spacer()
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

// MARK: - Flow Layout for Tags
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(in: proposal.width ?? 0, subviews: subviews, spacing: spacing)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(in: bounds.width, subviews: subviews, spacing: spacing)
        for (index, subview) in subviews.enumerated() {
            subview.place(at: CGPoint(x: bounds.minX + result.positions[index].x,
                                       y: bounds.minY + result.positions[index].y),
                          proposal: .unspecified)
        }
    }

    struct FlowResult {
        var size: CGSize = .zero
        var positions: [CGPoint] = []

        init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var currentX: CGFloat = 0
            var currentY: CGFloat = 0
            var lineHeight: CGFloat = 0

            for subview in subviews {
                let viewSize = subview.sizeThatFits(.unspecified)

                if currentX + viewSize.width > maxWidth, currentX > 0 {
                    currentX = 0
                    currentY += lineHeight + spacing
                    lineHeight = 0
                }

                positions.append(CGPoint(x: currentX, y: currentY))
                lineHeight = max(lineHeight, viewSize.height)
                currentX += viewSize.width + spacing
                size.width = max(size.width, currentX)
            }

            size.height = currentY + lineHeight
        }
    }
}

#Preview {
    SwipeCardView(
        option: TripOption(
            id: "1",
            title: "Scottsdale Classic",
            destination: "Scottsdale, AZ",
            courses: [
                CourseInfo(name: "TPC Scottsdale", rating: 4.8, greenFee: 35000, teeTime: "8:00 AM"),
                CourseInfo(name: "Troon North", rating: 4.7, greenFee: 32000, teeTime: "12:30 PM")
            ],
            lodging: LodgingInfo(name: "The Phoenician", type: "Resort", area: "Old Town", pricePerNight: 45000),
            costEstimate: CostEstimate(perPersonEstimated: 125000, breakdown: nil),
            whyItFits: ["Great weather", "Top courses", "Fits budget", "Near nightlife"],
            highlights: nil
        ),
        swipeProgress: 0.3
    )
    .padding(24)
    .background(Color.gray100)
}
