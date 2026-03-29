import SwiftUI

// MARK: - Skeleton Loading Modifier
struct SkeletonModifier: ViewModifier {
    @State private var isAnimating = false

    func body(content: Content) -> some View {
        content
            .overlay(
                LinearGradient(
                    colors: [
                        Color.gray200,
                        Color.gray100,
                        Color.gray200
                    ],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .offset(x: isAnimating ? 200 : -200)
            )
            .mask(content)
            .onAppear {
                withAnimation(
                    .linear(duration: 1.5)
                    .repeatForever(autoreverses: false)
                ) {
                    isAnimating = true
                }
            }
    }
}

extension View {
    func skeleton() -> some View {
        modifier(SkeletonModifier())
    }
}

// MARK: - Skeleton Shapes
struct SkeletonLine: View {
    var width: CGFloat = .infinity
    var height: CGFloat = 16

    var body: some View {
        RoundedRectangle(cornerRadius: height / 2)
            .fill(Color.gray200)
            .frame(maxWidth: width == .infinity ? .infinity : width, minHeight: height, maxHeight: height)
            .skeleton()
    }
}

struct SkeletonCircle: View {
    var size: CGFloat = 40

    var body: some View {
        Circle()
            .fill(Color.gray200)
            .frame(width: size, height: size)
            .skeleton()
    }
}

struct SkeletonRect: View {
    var width: CGFloat = .infinity
    var height: CGFloat = 100
    var cornerRadius: CGFloat = 12

    var body: some View {
        RoundedRectangle(cornerRadius: cornerRadius)
            .fill(Color.gray200)
            .frame(maxWidth: width == .infinity ? .infinity : width, minHeight: height, maxHeight: height)
            .skeleton()
    }
}

// MARK: - Pre-built Skeleton Cards
struct SkeletonRosterRow: View {
    var body: some View {
        HStack(spacing: 12) {
            SkeletonLine(width: 24, height: 16)
            SkeletonCircle(size: 36)
            VStack(alignment: .leading, spacing: 6) {
                SkeletonLine(width: 120, height: 14)
                SkeletonLine(width: 80, height: 12)
            }
            Spacer()
            SkeletonLine(width: 60, height: 28)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}

struct SkeletonLeaderboardRow: View {
    var body: some View {
        HStack(spacing: 12) {
            SkeletonLine(width: 28, height: 20)
            SkeletonCircle(size: 40)
            SkeletonLine(width: 100, height: 14)
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                SkeletonLine(width: 40, height: 20)
                SkeletonLine(width: 30, height: 14)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }
}

struct SkeletonEventCard: View {
    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            VStack(spacing: 0) {
                SkeletonCircle(size: 12)
            }
            .frame(width: 20)

            SkeletonLine(width: 70, height: 14)

            VStack(alignment: .leading, spacing: 8) {
                SkeletonLine(width: 180, height: 18)
                SkeletonLine(width: 120, height: 14)
                SkeletonLine(width: 80, height: 24)
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(12)
        }
    }
}

struct SkeletonTripCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            SkeletonRect(height: 120, cornerRadius: 0)
            VStack(alignment: .leading, spacing: 8) {
                SkeletonLine(width: 200, height: 24)
                SkeletonLine(width: 140, height: 16)
                HStack(spacing: 16) {
                    SkeletonLine(width: 80, height: 14)
                    SkeletonLine(width: 80, height: 14)
                }
            }
            .padding(16)
        }
        .background(Color.white)
        .cornerRadius(16)
    }
}

// MARK: - Skeleton List Views
struct SkeletonRosterList: View {
    var count: Int = 5

    var body: some View {
        VStack(spacing: 0) {
            ForEach(0..<count, id: \.self) { index in
                SkeletonRosterRow()
                if index < count - 1 {
                    Divider().padding(.leading, 56)
                }
            }
        }
        .background(Color.white)
        .cornerRadius(16)
    }
}

struct SkeletonLeaderboardList: View {
    var count: Int = 4

    var body: some View {
        VStack(spacing: 0) {
            ForEach(0..<count, id: \.self) { index in
                SkeletonLeaderboardRow()
                if index < count - 1 {
                    Divider().padding(.leading, 56)
                }
            }
        }
        .background(Color.white)
        .cornerRadius(12)
    }
}

#Preview {
    ScrollView {
        VStack(spacing: 24) {
            Text("Skeleton Components")
                .font(.heading2)

            Group {
                Text("Lines").font(.labelMedium)
                SkeletonLine()
                SkeletonLine(width: 200)
                SkeletonLine(width: 100, height: 24)
            }

            Group {
                Text("Shapes").font(.labelMedium)
                HStack {
                    SkeletonCircle()
                    SkeletonCircle(size: 60)
                    SkeletonRect(width: 100, height: 60)
                }
            }

            Group {
                Text("Roster Row").font(.labelMedium)
                SkeletonRosterRow()
                    .background(Color.white)
                    .cornerRadius(12)
            }

            Group {
                Text("Leaderboard Row").font(.labelMedium)
                SkeletonLeaderboardRow()
                    .background(Color.white)
                    .cornerRadius(12)
            }

            Group {
                Text("Trip Card").font(.labelMedium)
                SkeletonTripCard()
            }

            Group {
                Text("Roster List").font(.labelMedium)
                SkeletonRosterList(count: 3)
            }
        }
        .padding()
    }
    .background(Color.gray50)
}
