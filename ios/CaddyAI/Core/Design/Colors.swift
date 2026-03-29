import SwiftUI

extension Color {
    // MARK: - Brand Colors (Primary Theme)
    static let forest = Color(red: 0.10, green: 0.30, blue: 0.18)      // #1A4D2E - PRIMARY
    static let forestLight = Color(red: 0.10, green: 0.30, blue: 0.18).opacity(0.1)
    static let forestDark = Color(red: 0.08, green: 0.24, blue: 0.14)  // Darker forest for pressed
    static let sand = Color(red: 0.96, green: 0.96, blue: 0.86)        // #F5F5DC - Secondary BG
    static let gold = Color(red: 0.83, green: 0.69, blue: 0.22)        // #D4AF37 - Accent

    // MARK: - Emerald (Legacy - keeping for compatibility)
    static let emerald50 = Color(red: 0.94, green: 0.99, blue: 0.96)   // #F0FDF4
    static let emerald100 = Color(red: 0.86, green: 0.99, blue: 0.91)  // #DCFCE7
    static let emerald200 = Color(red: 0.73, green: 0.97, blue: 0.82)  // #BBF7D0
    static let emerald400 = Color(red: 0.29, green: 0.87, blue: 0.50)  // #4ADE80
    static let emerald500 = Color(red: 0.06, green: 0.72, blue: 0.51)  // #10B981
    static let emerald600 = Color(red: 0.02, green: 0.59, blue: 0.41)  // #059669
    static let emerald700 = Color(red: 0.02, green: 0.47, blue: 0.34)  // #047857
    static let emerald800 = Color(red: 0.02, green: 0.37, blue: 0.27)  // #065F46

    // MARK: - Status Colors
    static let success = Color(red: 0.13, green: 0.77, blue: 0.37)     // #22C55E
    static let error = Color(red: 0.94, green: 0.27, blue: 0.27)       // #EF4444
    static let warning = Color(red: 0.98, green: 0.75, blue: 0.15)     // #FBBF24

    // MARK: - Gray Scale
    static let gray50 = Color(red: 0.98, green: 0.98, blue: 0.98)      // #F9FAFB
    static let gray100 = Color(red: 0.95, green: 0.96, blue: 0.96)     // #F3F4F6
    static let gray200 = Color(red: 0.90, green: 0.91, blue: 0.92)     // #E5E7EB
    static let gray300 = Color(red: 0.82, green: 0.84, blue: 0.85)     // #D1D5DB
    static let gray400 = Color(red: 0.61, green: 0.64, blue: 0.69)     // #9CA3AF
    static let gray500 = Color(red: 0.42, green: 0.45, blue: 0.49)     // #6B7280
    static let gray600 = Color(red: 0.29, green: 0.33, blue: 0.39)     // #4B5563
    static let gray700 = Color(red: 0.22, green: 0.25, blue: 0.32)     // #374151
    static let gray900 = Color(red: 0.07, green: 0.09, blue: 0.15)     // #111827
}

// MARK: - Convenience Extensions
extension Color {
    // Primary Theme
    static let caddyPrimary = forest
    static let caddyAccent = gold
    static let caddyBackground = gray50
    static let caddySecondaryBackground = sand
    static let caddyCard = Color.white
    static let caddyBorder = gray200
    static let caddyText = gray900
    static let caddySecondaryText = gray500
}

// MARK: - Adaptive Colors (Dark Mode Support)
extension Color {
    /// Adaptive background that works in both light and dark mode
    static var adaptiveBackground: Color {
        Color(UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? UIColor(red: 0.07, green: 0.09, blue: 0.11, alpha: 1.0)  // Dark gray
                : UIColor(red: 0.98, green: 0.98, blue: 0.98, alpha: 1.0)  // gray50
        })
    }

    /// Adaptive card background
    static var adaptiveCard: Color {
        Color(UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? UIColor(red: 0.12, green: 0.14, blue: 0.16, alpha: 1.0)  // Dark card
                : UIColor.white
        })
    }

    /// Adaptive text color
    static var adaptiveText: Color {
        Color(UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? UIColor(red: 0.95, green: 0.95, blue: 0.97, alpha: 1.0)  // Light text
                : UIColor(red: 0.07, green: 0.09, blue: 0.15, alpha: 1.0)  // gray900
        })
    }

    /// Adaptive secondary text
    static var adaptiveSecondaryText: Color {
        Color(UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? UIColor(red: 0.60, green: 0.62, blue: 0.65, alpha: 1.0)
                : UIColor(red: 0.42, green: 0.45, blue: 0.49, alpha: 1.0)  // gray500
        })
    }

    /// Adaptive forest green that's visible in dark mode
    static var adaptiveForest: Color {
        Color(UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? UIColor(red: 0.20, green: 0.50, blue: 0.30, alpha: 1.0)  // Lighter forest
                : UIColor(red: 0.10, green: 0.30, blue: 0.18, alpha: 1.0)  // Original forest
        })
    }

    /// Adaptive gold that's visible in dark mode
    static var adaptiveGold: Color {
        Color(UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? UIColor(red: 0.90, green: 0.76, blue: 0.30, alpha: 1.0)  // Brighter gold
                : UIColor(red: 0.83, green: 0.69, blue: 0.22, alpha: 1.0)  // Original gold
        })
    }

    /// Adaptive border color
    static var adaptiveBorder: Color {
        Color(UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? UIColor(red: 0.20, green: 0.22, blue: 0.25, alpha: 1.0)
                : UIColor(red: 0.90, green: 0.91, blue: 0.92, alpha: 1.0)  // gray200
        })
    }
}
