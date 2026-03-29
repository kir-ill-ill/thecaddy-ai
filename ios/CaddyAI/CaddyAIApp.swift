import SwiftUI

@main
struct CaddyAIApp: App {
    @AppStorage("hasCompletedOnboarding") private var hasCompletedOnboarding = false
    @State private var showSplash = true

    var body: some Scene {
        WindowGroup {
            ZStack {
                if showSplash {
                    SplashView()
                        .transition(.opacity)
                } else if !hasCompletedOnboarding {
                    OnboardingView(hasCompletedOnboarding: $hasCompletedOnboarding)
                        .transition(.opacity)
                } else {
                    ContentView()
                        .transition(.opacity)
                }
            }
            .animation(.easeInOut(duration: 0.5), value: showSplash)
            .animation(.easeInOut(duration: 0.3), value: hasCompletedOnboarding)
            .onAppear {
                // Dismiss splash after animation completes
                DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                    withAnimation {
                        showSplash = false
                    }
                }
            }
            .onOpenURL { url in
                // Handle deep links
                // caddy://trip/{shareCode}
                // caddy://pay/{requestCode}
                AppState.shared.handleDeepLink(url)
            }
        }
    }
}
