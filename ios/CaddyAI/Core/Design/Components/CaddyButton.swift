import SwiftUI

struct CaddyButton: View {
    let title: String
    let action: () -> Void
    var style: Style = .primary
    var icon: String? = nil
    var isLoading: Bool = false
    var isDisabled: Bool = false
    var isFullWidth: Bool = true

    enum Style {
        case primary
        case secondary
        case ghost
        case danger
    }

    var body: some View {
        Button(action: {
            // Haptic feedback based on button style
            switch style {
            case .primary, .secondary, .ghost:
                CaddyHaptics.light()
            case .danger:
                CaddyHaptics.warning()
            }
            action()
        }) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: foregroundColor))
                        .scaleEffect(0.8)
                }

                if let icon = icon, !isLoading {
                    Image(systemName: icon)
                        .font(.system(size: 16, weight: .semibold))
                }

                Text(title)
                    .font(.labelMedium)
            }
            .frame(maxWidth: isFullWidth ? .infinity : nil)
            .padding(.vertical, 14)
            .padding(.horizontal, 24)
            .background(backgroundColor)
            .foregroundColor(foregroundColor)
            .cornerRadius(12)
            .overlay(borderOverlay)
        }
        .buttonStyle(ScaleButtonStyle())
        .disabled(isDisabled || isLoading)
        .opacity(isDisabled ? 0.5 : 1)
    }

    private var backgroundColor: Color {
        switch style {
        case .primary:
            return .forest
        case .secondary:
            return .white
        case .ghost:
            return .clear
        case .danger:
            return .error
        }
    }

    private var foregroundColor: Color {
        switch style {
        case .primary, .danger:
            return .white
        case .secondary:
            return .gray700
        case .ghost:
            return .forest
        }
    }

    @ViewBuilder
    private var borderOverlay: some View {
        if style == .secondary {
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.gray300, lineWidth: 1)
        } else {
            EmptyView()
        }
    }
}

// MARK: - Circle Action Button (for swipe actions)
struct CircleActionButton: View {
    let icon: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: {
            CaddyHaptics.medium()
            action()
        }) {
            Image(systemName: icon)
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(color)
                .frame(width: 64, height: 64)
                .background(color.opacity(0.15))
                .clipShape(Circle())
        }
        .buttonStyle(ScaleButtonStyle())
        .accessibilityLabel(icon == "xmark" ? "Reject" : "Accept")
        .accessibilityHint(icon == "xmark" ? "Swipe left to reject this option" : "Swipe right to accept this option")
    }
}

// MARK: - Scale Button Style
struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

#Preview {
    VStack(spacing: 16) {
        CaddyButton(title: "Primary Button", action: {})

        CaddyButton(title: "Secondary", action: {}, style: .secondary)

        CaddyButton(title: "With Icon", action: {}, icon: "arrow.right")

        CaddyButton(title: "Loading...", action: {}, isLoading: true)

        CaddyButton(title: "Disabled", action: {}, isDisabled: true)

        HStack(spacing: 24) {
            CircleActionButton(icon: "xmark", color: .error) {}
            CircleActionButton(icon: "heart.fill", color: .success) {}
        }
    }
    .padding()
}
