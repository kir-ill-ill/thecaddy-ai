import SwiftUI

extension Font {
    // MARK: - Headings (Serif - Premium Golf Club Aesthetic)
    static let heading1 = Font.custom("Georgia-Bold", size: 28)
    static let heading2 = Font.custom("Georgia-Bold", size: 24)
    static let heading3 = Font.custom("Georgia", size: 20).weight(.semibold)
    static let heading4 = Font.custom("Georgia", size: 18).weight(.semibold)

    // MARK: - Body Text (Sans-Serif - Clean & Modern)
    static let bodyLarge = Font.system(size: 16, weight: .regular)
    static let bodyMedium = Font.system(size: 14, weight: .regular)
    static let bodySmall = Font.system(size: 12, weight: .regular)

    // MARK: - Labels (Sans-Serif - Functional)
    static let labelLarge = Font.system(size: 16, weight: .semibold)
    static let labelMedium = Font.system(size: 14, weight: .semibold)
    static let labelSmall = Font.system(size: 12, weight: .medium)

    // MARK: - Special
    static let priceDisplay = Font.custom("Georgia-Bold", size: 32)
    static let priceSmall = Font.custom("Georgia-Bold", size: 24)
    static let caption = Font.system(size: 10, weight: .medium)
    static let microLabel = Font.system(size: 10, weight: .bold)  // For "THE CUT LINE" style labels
}

// MARK: - Text Style Modifiers
extension View {
    func headingStyle() -> some View {
        self.font(.heading1)
            .foregroundColor(.gray900)
    }

    func bodyStyle() -> some View {
        self.font(.bodyMedium)
            .foregroundColor(.gray700)
    }

    func captionStyle() -> some View {
        self.font(.bodySmall)
            .foregroundColor(.gray500)
    }
}
