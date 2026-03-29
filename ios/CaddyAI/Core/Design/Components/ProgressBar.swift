import SwiftUI

struct CaddyProgressBar: View {
    let progress: Double // 0.0 to 1.0
    var height: CGFloat = 8
    var backgroundColor: Color = .gray200
    var foregroundColor: Color = .forest
    var showPercentage: Bool = false

    var body: some View {
        VStack(alignment: .trailing, spacing: 4) {
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    // Background
                    RoundedRectangle(cornerRadius: height / 2)
                        .fill(backgroundColor)

                    // Progress
                    RoundedRectangle(cornerRadius: height / 2)
                        .fill(foregroundColor)
                        .frame(width: geometry.size.width * min(max(progress, 0), 1))
                        .animation(.spring(duration: 0.5), value: progress)
                }
            }
            .frame(height: height)

            if showPercentage {
                Text("\(Int(progress * 100))%")
                    .font(.labelSmall)
                    .foregroundColor(.gray500)
            }
        }
    }
}

// MARK: - Progress Section (with labels)
struct ProgressSection: View {
    let title: String
    let current: Double
    let target: Double
    var formatAsCurrency: Bool = true

    private var progress: Double {
        guard target > 0 else { return 0 }
        return current / target
    }

    var body: some View {
        CaddyCard {
            VStack(spacing: 12) {
                HStack {
                    Text(title)
                        .font(.labelMedium)
                        .foregroundColor(.gray700)

                    Spacer()

                    Text(formattedProgress)
                        .font(.bodySmall)
                        .foregroundColor(.gray500)
                }

                CaddyProgressBar(progress: progress)

                HStack {
                    Text(formatAsCurrency ? formatCurrency(current) : "\(Int(current))")
                        .font(.labelMedium)
                        .foregroundColor(.forest)

                    Spacer()

                    Text("Goal: \(formatAsCurrency ? formatCurrency(target) : "\(Int(target))")")
                        .font(.bodySmall)
                        .foregroundColor(.gray500)
                }
            }
        }
    }

    private var formattedProgress: String {
        "\(Int(progress * 100))% complete"
    }

    private func formatCurrency(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        return formatter.string(from: NSNumber(value: value / 100)) ?? "$0.00"
    }
}

#Preview {
    VStack(spacing: 24) {
        CaddyProgressBar(progress: 0.65)

        CaddyProgressBar(progress: 0.35, height: 12, showPercentage: true)

        CaddyProgressBar(
            progress: 0.8,
            foregroundColor: .success
        )

        ProgressSection(
            title: "Trip Fund Progress",
            current: 245000,
            target: 500000
        )
    }
    .padding()
    .background(Color.gray50)
}
