import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    @State private var showTripEntry = false
    @State private var showPaymentSheet = false

    private var appState: AppState { AppState.shared }

    var body: some View {
        ZStack {
            // Main Tab View
            TabView(selection: $selectedTab) {
                // Scorecard Tab (Dashboard + Leaderboard)
                ScorecardView()
                    .tabItem {
                        Label("Scorecard", systemImage: "trophy")
                    }
                    .tag(0)
                    .accessibilityLabel("Scorecard")
                    .accessibilityHint("View trip overview, finances, and leaderboard")

                // Roster Tab
                RosterView()
                    .tabItem {
                        Label("Roster", systemImage: "person.3")
                    }
                    .tag(1)
                    .accessibilityLabel("Roster")
                    .accessibilityHint("Manage trip members and waitlist")

                // Voting Tab
                VotingView()
                    .tabItem {
                        Label("Vote", systemImage: "checkmark.circle")
                    }
                    .tag(2)
                    .accessibilityLabel("Vote")
                    .accessibilityHint("Vote on trip destinations")

                // Itinerary Tab
                ItineraryView()
                    .tabItem {
                        Label("Itinerary", systemImage: "calendar")
                    }
                    .tag(3)
                    .accessibilityLabel("Itinerary")
                    .accessibilityHint("View trip schedule and events")
            }
            .tint(.forest)
            .onChange(of: selectedTab) { oldValue, newValue in
                if oldValue != newValue {
                    CaddyHaptics.selection()
                }
            }
        }
        .onAppear {
            // Show trip entry if no trip is loaded
            if appState.currentTripId == nil {
                showTripEntry = true
            }

            // Check for pending payment
            if appState.pendingPaymentCode != nil {
                showPaymentSheet = true
            }
        }
        .fullScreenCover(isPresented: $showTripEntry) {
            TripEntryView(onTripLoaded: {
                withAnimation {
                    showTripEntry = false
                }
            })
        }
        .sheet(isPresented: $showPaymentSheet) {
            if let paymentCode = appState.pendingPaymentCode {
                NavigationStack {
                    PaymentView(requestCode: paymentCode)
                        .navigationBarTitleDisplayMode(.inline)
                        .toolbar {
                            ToolbarItem(placement: .topBarLeading) {
                                Button("Close") {
                                    appState.pendingPaymentCode = nil
                                    showPaymentSheet = false
                                }
                            }
                        }
                }
            }
        }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    if let trip = appState.currentTrip?.trip {
                        Text(trip.tripName)
                            .font(.headline)

                        Divider()

                        Button(action: {
                            // Share trip code
                            let shareCode = trip.shareCode
                            UIPasteboard.general.string = shareCode
                            CaddyHaptics.success()
                        }) {
                            Label("Copy Share Code", systemImage: "doc.on.doc")
                        }
                    }

                    Button(role: .destructive, action: {
                        appState.clearTrip()
                        showTripEntry = true
                    }) {
                        Label("Switch Trip", systemImage: "arrow.triangle.2.circlepath")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                        .foregroundColor(.forest)
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
