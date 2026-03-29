import SwiftUI

struct CaddyCard<Content: View>: View {
    let content: Content
    var isSelected: Bool = false
    var padding: CGFloat = 16

    init(
        isSelected: Bool = false,
        padding: CGFloat = 16,
        @ViewBuilder content: () -> Content
    ) {
        self.isSelected = isSelected
        self.padding = padding
        self.content = content()
    }

    var body: some View {
        content
            .padding(padding)
            .background(Color.white)
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(
                        isSelected ? Color.forest : Color.gray200,
                        lineWidth: isSelected ? 2 : 1
                    )
            )
            .shadow(
                color: .black.opacity(isSelected ? 0.1 : 0.05),
                radius: isSelected ? 12 : 8,
                x: 0,
                y: isSelected ? 4 : 2
            )
    }
}

// MARK: - Stat Card Component
struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    var color: Color = .forest

    var body: some View {
        CaddyCard {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    Image(systemName: icon)
                        .foregroundColor(color)
                        .font(.system(size: 16))
                        .frame(width: 32, height: 32)
                        .background(color.opacity(0.15))
                        .clipShape(Circle())

                    Text(title)
                        .font(.bodySmall)
                        .foregroundColor(.gray500)
                }

                Text(value)
                    .font(.priceSmall)
                    .foregroundColor(.gray900)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

// MARK: - Featured Card (Gradient Header)
struct FeaturedCard<Content: View>: View {
    let title: String
    let subtitle: String?
    let content: Content

    init(
        title: String,
        subtitle: String? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.title = title
        self.subtitle = subtitle
        self.content = content()
    }

    var body: some View {
        VStack(spacing: 0) {
            // Gradient Header
            VStack(spacing: 4) {
                Text(title)
                    .font(.heading2)
                    .foregroundColor(.white)

                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.bodyMedium)
                        .foregroundColor(.white.opacity(0.8))
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 24)
            .padding(.horizontal, 16)
            .background(
                LinearGradient(
                    colors: [.forest, .forestDark],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )

            // Content
            content
                .padding(16)
                .background(Color.white)
        }
        .cornerRadius(20)
        .shadow(color: .black.opacity(0.1), radius: 16, x: 0, y: 4)
    }
}

#Preview {
    ScrollView {
        VStack(spacing: 16) {
            CaddyCard {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Basic Card")
                        .font(.heading3)
                    Text("This is a basic card component")
                        .font(.bodyMedium)
                        .foregroundColor(.gray600)
                }
            }

            CaddyCard(isSelected: true) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Selected Card")
                        .font(.heading3)
                    Text("This card is selected")
                        .font(.bodyMedium)
                        .foregroundColor(.gray600)
                }
            }

            HStack(spacing: 12) {
                StatCard(
                    title: "Collected",
                    value: "$2,450",
                    icon: "dollarsign.circle.fill",
                    color: .forest
                )

                StatCard(
                    title: "Pending",
                    value: "3",
                    icon: "clock.fill",
                    color: .warning
                )
            }

            FeaturedCard(title: "Trip Fund", subtitle: "Scottsdale 2025") {
                VStack(spacing: 12) {
                    HStack {
                        Text("Progress")
                        Spacer()
                        Text("65%")
                    }
                    .font(.bodyMedium)

                    ProgressView(value: 0.65)
                        .tint(.forest)
                }
            }
        }
        .padding()
    }
    .background(Color.gray50)
}
