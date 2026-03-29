import SwiftUI

struct LoadingSpinner: View {
    var size: CGFloat = 40
    var color: Color = .forest

    var body: some View {
        ProgressView()
            .progressViewStyle(CircularProgressViewStyle(tint: color))
            .scaleEffect(size / 20)
    }
}

// MARK: - Full Screen Loading
struct LoadingView: View {
    var message: String = "Loading..."

    var body: some View {
        VStack(spacing: 16) {
            LoadingSpinner(size: 48)

            Text(message)
                .font(.bodyMedium)
                .foregroundColor(.gray600)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.gray50)
    }
}

// MARK: - Loading Overlay
struct LoadingOverlay: ViewModifier {
    let isLoading: Bool
    var message: String = "Loading..."

    func body(content: Content) -> some View {
        ZStack {
            content
                .disabled(isLoading)
                .blur(radius: isLoading ? 2 : 0)

            if isLoading {
                Color.black.opacity(0.3)
                    .ignoresSafeArea()

                VStack(spacing: 16) {
                    LoadingSpinner(size: 48, color: .white)

                    Text(message)
                        .font(.labelMedium)
                        .foregroundColor(.white)
                }
                .padding(32)
                .background(Color.gray900.opacity(0.8))
                .cornerRadius(16)
            }
        }
    }
}

extension View {
    func loadingOverlay(isLoading: Bool, message: String = "Loading...") -> some View {
        modifier(LoadingOverlay(isLoading: isLoading, message: message))
    }
}

// MARK: - Typing Indicator (Chat)
struct TypingIndicator: View {
    @State private var animating = false

    var body: some View {
        HStack(spacing: 4) {
            ForEach(0..<3, id: \.self) { index in
                Circle()
                    .fill(Color.gray400)
                    .frame(width: 8, height: 8)
                    .offset(y: animating ? -4 : 4)
                    .animation(
                        .easeInOut(duration: 0.5)
                        .repeatForever()
                        .delay(Double(index) * 0.15),
                        value: animating
                    )
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color.gray100)
        .cornerRadius(20)
        .onAppear {
            animating = true
        }
    }
}

#Preview {
    VStack(spacing: 32) {
        LoadingSpinner()

        LoadingSpinner(size: 60, color: .success)

        TypingIndicator()

        CaddyButton(title: "Submit", action: {})
            .loadingOverlay(isLoading: true)
    }
    .padding()
}
