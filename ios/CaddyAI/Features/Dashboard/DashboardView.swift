import SwiftUI

struct DashboardView: View {
    @State private var fundSummary: FundSummary?
    @State private var isLoading = true
    @State private var showAddSheet = false
    @State private var accessCode = ""
    @State private var showAccessCodeInput = true
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            ZStack {
                Color.gray50.ignoresSafeArea()

                if showAccessCodeInput {
                    accessCodeInputView
                } else if isLoading {
                    LoadingView(message: "Loading fund data...")
                } else if let summary = fundSummary {
                    dashboardContent(summary)
                } else {
                    emptyStateView
                }
            }
            .navigationTitle("Dashboard")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                if !showAccessCodeInput && fundSummary != nil {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button {
                            showAddSheet = true
                        } label: {
                            Image(systemName: "plus.circle.fill")
                                .foregroundColor(.forest)
                        }
                    }
                }
            }
            .sheet(isPresented: $showAddSheet) {
                AddRequestsSheet(fundId: fundSummary?.fund.id ?? "") {
                    loadFundData()
                }
            }
        }
    }

    // MARK: - Access Code Input
    private var accessCodeInputView: some View {
        VStack(spacing: 24) {
            Spacer()

            VStack(spacing: 16) {
                Image(systemName: "lock.shield.fill")
                    .font(.system(size: 64))
                    .foregroundColor(.forest)

                Text("Captain Access")
                    .font(.heading2)
                    .foregroundColor(.gray900)

                Text("Enter your access code to manage the fund")
                    .font(.bodyMedium)
                    .foregroundColor(.gray500)
                    .multilineTextAlignment(.center)
            }

            VStack(spacing: 16) {
                CaddyTextField(
                    placeholder: "Access code",
                    text: $accessCode,
                    icon: "key"
                )

                if let error = errorMessage {
                    Text(error)
                        .font(.bodySmall)
                        .foregroundColor(.error)
                }

                CaddyButton(title: "Access Dashboard", action: {
                    withAnimation {
                        showAccessCodeInput = false
                    }
                    loadFundData()
                }, icon: "arrow.right")
                .disabled(accessCode.isEmpty)
            }
            .padding(.horizontal, 32)

            Spacer()
        }
    }

    // MARK: - Empty State
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "dollarsign.circle")
                .font(.system(size: 48))
                .foregroundColor(.gray400)

            Text("No Fund Found")
                .font(.heading3)
                .foregroundColor(.gray700)

            Text("Create a fund for your trip first")
                .font(.bodyMedium)
                .foregroundColor(.gray500)

            CaddyButton(title: "Try Different Code", action: {
                withAnimation {
                    showAccessCodeInput = true
                    accessCode = ""
                    errorMessage = nil
                }
            }, style: .secondary, isFullWidth: false)
        }
    }

    // MARK: - Dashboard Content
    private func dashboardContent(_ summary: FundSummary) -> some View {
        ScrollView {
            VStack(spacing: 20) {
                // Fund Header
                fundHeader(summary.fund)

                // Stats Grid
                statsGrid(summary.stats)

                // Progress Section
                if let target = summary.stats.targetAmount {
                    ProgressSection(
                        title: "Progress to Goal",
                        current: Double(summary.stats.totalCollected),
                        target: Double(target)
                    )
                }

                // Payment Requests
                paymentRequestsSection(summary.requests)
            }
            .padding(16)
        }
        .refreshable {
            await refreshData()
        }
    }

    // MARK: - Fund Header
    private func fundHeader(_ fund: Fund) -> some View {
        CaddyCard {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(fund.name)
                        .font(.heading3)
                        .foregroundColor(.gray900)

                    Text(FundType(rawValue: fund.fundType)?.displayName ?? fund.fundType)
                        .font(.bodySmall)
                        .foregroundColor(.gray500)
                }

                Spacer()

                Image(systemName: "crown.fill")
                    .foregroundColor(.gold)
                    .font(.title2)
            }
        }
    }

    // MARK: - Stats Grid
    private func statsGrid(_ stats: FundStats) -> some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: 12) {
            StatCard(
                title: "Collected",
                value: formatCurrency(stats.totalCollected),
                icon: "dollarsign.circle.fill",
                color: .forest
            )

            StatCard(
                title: "Pending",
                value: formatCurrency(stats.totalPending),
                icon: "clock.fill",
                color: .warning
            )

            StatCard(
                title: "Paid",
                value: "\(stats.paymentCount)",
                icon: "checkmark.circle.fill",
                color: .success
            )

            StatCard(
                title: "Waiting",
                value: "\(stats.pendingRequestCount)",
                icon: "hourglass",
                color: .gray500
            )
        }
    }

    // MARK: - Payment Requests Section
    private func paymentRequestsSection(_ requests: [PaymentRequest]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Payment Requests")
                    .font(.heading4)
                    .foregroundColor(.gray900)

                Spacer()

                Button {
                    showAddSheet = true
                } label: {
                    Label("Add", systemImage: "plus")
                        .font(.labelSmall)
                        .foregroundColor(.forest)
                }
            }

            if requests.isEmpty {
                emptyRequestsView
            } else {
                ForEach(requests) { request in
                    PaymentRequestRow(request: request)
                }
            }
        }
    }

    private var emptyRequestsView: some View {
        CaddyCard {
            VStack(spacing: 12) {
                Image(systemName: "envelope.badge")
                    .font(.system(size: 32))
                    .foregroundColor(.gray400)

                Text("No payment requests yet")
                    .font(.bodyMedium)
                    .foregroundColor(.gray500)

                CaddyButton(title: "Send First Request", action: {
                    showAddSheet = true
                }, style: .secondary, isFullWidth: false)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
        }
    }

    // MARK: - Helpers
    private func formatCurrency(_ cents: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        return formatter.string(from: NSNumber(value: Double(cents) / 100)) ?? "$0"
    }

    private func loadFundData() {
        guard let tripId = AppState.shared.currentTripId else {
            errorMessage = "No trip selected"
            showAccessCodeInput = true
            return
        }

        isLoading = true
        errorMessage = nil

        Task {
            do {
                // Try to get fund by trip ID with access code
                let summary: FundSummary = try await APIClient.shared.request(
                    .getFundByTrip(tripId: tripId, accessCode: accessCode)
                )

                await MainActor.run {
                    fundSummary = summary
                    // Store fund info in AppState
                    AppState.shared.setFundAccess(fundId: summary.fund.id, accessCode: accessCode)
                    isLoading = false
                }
            } catch let error as APIError {
                await MainActor.run {
                    isLoading = false
                    switch error {
                    case .unauthorized, .httpError(statusCode: 401, _):
                        errorMessage = "Invalid access code"
                        showAccessCodeInput = true
                        accessCode = ""
                    case .notFound, .httpError(statusCode: 404, _):
                        errorMessage = "No fund found for this trip"
                        fundSummary = nil
                    default:
                        errorMessage = error.localizedDescription
                    }
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = "Failed to load fund data"
                }
            }
        }
    }

    private func refreshData() async {
        loadFundData()
    }
}

#Preview {
    DashboardView()
}
