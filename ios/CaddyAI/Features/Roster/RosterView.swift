import SwiftUI

struct RosterView: View {
    @State private var roster: [RosterMember] = RosterMember.demoRoster
    @State private var waitlist: [RosterMember] = RosterMember.demoWaitlist
    @State private var toast: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    headerSection

                    // Priority Note
                    Text("Priority determined by deposit timestamp.")
                        .font(.caption)
                        .foregroundColor(.gray600)
                        .italic()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal)

                    // Active Roster
                    rosterList

                    // Cut Line
                    cutLineDivider

                    // Waitlist
                    waitlistSection
                }
                .padding(.vertical, 16)
            }
            .background(Color.gray50)
            .navigationTitle("The Roster")
            .navigationBarTitleDisplayMode(.inline)
            .overlay(toastOverlay)
        }
    }

    // MARK: - Header
    private var headerSection: some View {
        HStack {
            Text("The Roster")
                .font(.heading2)
                .foregroundColor(.gray900)

            Spacer()

            Text("\(roster.count)/12 Full")
                .font(.labelSmall)
                .foregroundColor(.white)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.forest)
                .clipShape(Capsule())
        }
        .padding(.horizontal)
    }

    // MARK: - Roster List
    private var rosterList: some View {
        VStack(spacing: 0) {
            ForEach(Array(roster.enumerated()), id: \.element.id) { index, member in
                RosterMemberRow(
                    rank: index + 1,
                    member: member,
                    onNudge: { showToast("Nudge sent to \(member.name)") }
                )

                if index < roster.count - 1 {
                    Divider()
                        .padding(.leading, 56)
                }
            }
        }
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, y: 2)
        .padding(.horizontal)
    }

    // MARK: - Cut Line
    private var cutLineDivider: some View {
        HStack(spacing: 0) {
            Rectangle()
                .fill(Color.clear)
                .frame(height: 2)
                .overlay(
                    GeometryReader { geo in
                        Path { path in
                            let dashWidth: CGFloat = 8
                            let gapWidth: CGFloat = 6
                            var x: CGFloat = 0
                            while x < geo.size.width {
                                path.move(to: CGPoint(x: x, y: 1))
                                path.addLine(to: CGPoint(x: min(x + dashWidth, geo.size.width), y: 1))
                                x += dashWidth + gapWidth
                            }
                        }
                        .stroke(Color.error.opacity(0.5), lineWidth: 2)
                    }
                )
        }
        .overlay(
            Text("THE CUT LINE")
                .font(.microLabel)
                .foregroundColor(.error)
                .tracking(2)
                .padding(.horizontal, 16)
                .background(Color.gray50)
        )
        .padding(.horizontal, 24)
        .padding(.vertical, 16)
    }

    // MARK: - Waitlist Section
    private var waitlistSection: some View {
        VStack(spacing: 0) {
            ForEach(Array(waitlist.enumerated()), id: \.element.id) { index, member in
                WaitlistMemberRow(
                    rank: roster.count + index + 1,
                    member: member
                )

                if index < waitlist.count - 1 {
                    Divider()
                        .padding(.leading, 56)
                }
            }
        }
        .background(Color.gray100)
        .cornerRadius(16)
        .opacity(0.8)
        .padding(.horizontal)
        .padding(.bottom, 24)
    }

    // MARK: - Toast
    private var toastOverlay: some View {
        Group {
            if let message = toast {
                VStack {
                    Spacer()
                    HStack(spacing: 8) {
                        Image(systemName: "checkmark")
                            .foregroundColor(.success)
                        Text(message)
                            .font(.labelSmall)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Color.gray900)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                    .shadow(radius: 8)
                    .padding(.bottom, 100)
                }
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
    }

    private func showToast(_ message: String) {
        withAnimation {
            toast = message
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
            withAnimation {
                toast = nil
            }
        }
    }
}

// MARK: - Roster Member Row
struct RosterMemberRow: View {
    let rank: Int
    let member: RosterMember
    let onNudge: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            // Rank
            Text("#\(rank)")
                .font(.caption)
                .foregroundColor(.gray400)
                .frame(width: 24)

            // Avatar
            ZStack {
                Circle()
                    .fill(Color.sand)
                    .frame(width: 36, height: 36)

                Text(member.avatarInitials)
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.forest)
            }
            .overlay(
                Circle()
                    .stroke(Color.forest.opacity(0.2), lineWidth: 1)
            )

            // Info
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(member.name)
                        .font(.labelMedium)
                        .foregroundColor(.gray900)

                    if member.role == .commissioner {
                        Image(systemName: "trophy.fill")
                            .font(.system(size: 12))
                            .foregroundColor(.gold)
                    }
                }

                HStack(spacing: 4) {
                    Text("\(member.handicap, specifier: "%.1f") HCP")
                        .font(.caption)
                        .foregroundColor(.gray500)

                    Text("•")
                        .foregroundColor(.gray400)

                    Text(member.status == .paid ? "Paid" : "Pending")
                        .font(.caption)
                        .fontWeight(member.status == .pending ? .bold : .regular)
                        .foregroundColor(member.status == .paid ? .success : .error)
                }
            }

            Spacer()

            // Nudge Button
            if member.status == .pending {
                Button(action: onNudge) {
                    Text("Nudge")
                        .font(.caption)
                        .foregroundColor(.error)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(Color.error.opacity(0.1))
                        .cornerRadius(6)
                        .overlay(
                            RoundedRectangle(cornerRadius: 6)
                                .stroke(Color.error.opacity(0.3), lineWidth: 1)
                        )
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}

// MARK: - Waitlist Member Row
struct WaitlistMemberRow: View {
    let rank: Int
    let member: RosterMember

    var body: some View {
        HStack(spacing: 12) {
            // Rank
            Text("#\(rank)")
                .font(.caption)
                .foregroundColor(.gray400)
                .frame(width: 24)

            // Avatar
            ZStack {
                Circle()
                    .fill(Color.gray200)
                    .frame(width: 36, height: 36)

                Text(member.avatarInitials)
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.gray500)
            }

            // Info
            VStack(alignment: .leading, spacing: 2) {
                Text(member.name)
                    .font(.labelMedium)
                    .foregroundColor(.gray600)

                Text("Waitlist • \(member.handicap, specifier: "%.1f") HCP")
                    .font(.caption)
                    .foregroundColor(.gray400)
            }

            Spacer()

            // On Deck Badge
            Text("ON DECK")
                .font(.microLabel)
                .foregroundColor(.gray400)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.gray200)
                .cornerRadius(4)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}

#Preview {
    RosterView()
}
