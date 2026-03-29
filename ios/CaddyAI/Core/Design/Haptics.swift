import SwiftUI
import UIKit

// MARK: - Haptic Feedback Manager
enum CaddyHaptics {
    /// Light feedback for subtle confirmations (button taps, page changes)
    static func light() {
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.impactOccurred()
    }

    /// Medium feedback for standard actions (successful operations, selections)
    static func medium() {
        let generator = UIImpactFeedbackGenerator(style: .medium)
        generator.impactOccurred()
    }

    /// Heavy feedback for significant actions (payments, confirmations)
    static func heavy() {
        let generator = UIImpactFeedbackGenerator(style: .heavy)
        generator.impactOccurred()
    }

    /// Success feedback (payment complete, vote submitted)
    static func success() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }

    /// Warning feedback (approaching limit, pending action)
    static func warning() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.warning)
    }

    /// Error feedback (validation failed, action blocked)
    static func error() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.error)
    }

    /// Selection changed feedback (picker, segmented control)
    static func selection() {
        let generator = UISelectionFeedbackGenerator()
        generator.selectionChanged()
    }

    /// Swipe feedback with intensity based on progress
    static func swipe(intensity: CGFloat) {
        let clampedIntensity = min(max(intensity, 0), 1)
        let generator = UIImpactFeedbackGenerator(style: .soft)
        generator.impactOccurred(intensity: clampedIntensity)
    }
}

// MARK: - View Extension for Easy Haptic Integration
extension View {
    /// Adds haptic feedback on tap
    func hapticOnTap(_ type: HapticType = .light) -> some View {
        self.simultaneousGesture(
            TapGesture().onEnded { _ in
                switch type {
                case .light: CaddyHaptics.light()
                case .medium: CaddyHaptics.medium()
                case .heavy: CaddyHaptics.heavy()
                case .success: CaddyHaptics.success()
                case .warning: CaddyHaptics.warning()
                case .error: CaddyHaptics.error()
                case .selection: CaddyHaptics.selection()
                }
            }
        )
    }
}

enum HapticType {
    case light
    case medium
    case heavy
    case success
    case warning
    case error
    case selection
}
