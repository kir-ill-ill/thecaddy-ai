import SwiftUI

struct SplashView: View {
    @State private var isAnimating = false
    @State private var loadingProgress: CGFloat = 0

    var body: some View {
        ZStack {
            // Forest green background
            Color.forest
                .ignoresSafeArea()

            VStack(spacing: 24) {
                Spacer()

                // Animated Icon
                Image(systemName: "person.3.fill")
                    .font(.system(size: 64))
                    .foregroundColor(.sand)
                    .scaleEffect(isAnimating ? 1.0 : 0.8)
                    .animation(
                        .easeInOut(duration: 0.6)
                        .repeatForever(autoreverses: true),
                        value: isAnimating
                    )

                // Title
                VStack(spacing: 8) {
                    Text("CaddyAI")
                        .font(.custom("Georgia-Bold", size: 40))
                        .foregroundColor(.white)
                        .tracking(2)

                    Text("ORCHESTRATING YOUR PERFECT ROUND")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.sand.opacity(0.8))
                        .tracking(3)
                }

                Spacer()

                // Loading Bar
                VStack(spacing: 8) {
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Color.sand.opacity(0.2))
                            .frame(width: 180, height: 4)

                        RoundedRectangle(cornerRadius: 2)
                            .fill(Color.gold)
                            .frame(width: 180 * loadingProgress, height: 4)
                    }
                }
                .padding(.bottom, 80)
            }
        }
        .onAppear {
            isAnimating = true
            withAnimation(.easeInOut(duration: 2.0)) {
                loadingProgress = 1.0
            }
        }
    }
}

#Preview {
    SplashView()
}
