import SwiftUI

struct VoteResultsView: View {
    let tripId: String
    let voterName: String

    @State private var results: [VoteResultItem] = []
    @State private var isLoading = true

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                headerSection

                // Results List
                if isLoading {
                    LoadingSpinner()
                        .padding(.top, 40)
                } else {
                    resultsSection
                }
            }
            .padding(20)
        }
        .background(Color.gray50)
        .onAppear {
            loadResults()
        }
    }

    // MARK: - Header Section
    private var headerSection: some View {
        VStack(spacing: 12) {
            Image(systemName: "chart.bar.fill")
                .font(.system(size: 48))
                .foregroundColor(.forest)

            Text("Vote Results")
                .font(.heading1)
                .foregroundColor(.gray900)

            Text("Thanks for voting, \(voterName)!")
                .font(.bodyMedium)
                .foregroundColor(.gray500)
        }
        .padding(.top, 20)
    }

    // MARK: - Results Section
    private var resultsSection: some View {
        VStack(spacing: 16) {
            ForEach(results.sorted(by: { $0.percentage > $1.percentage })) { result in
                resultCard(result)
            }
        }
    }

    // MARK: - Result Card
    private func resultCard(_ result: VoteResultItem) -> some View {
        CaddyCard(isSelected: result.isWinner) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 8) {
                            Text(result.title)
                                .font(.labelLarge)
                                .foregroundColor(.gray900)

                            if result.isWinner {
                                Label("Top Pick", systemImage: "crown.fill")
                                    .font(.caption)
                                    .foregroundColor(.gold)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color.gold.opacity(0.15))
                                    .cornerRadius(8)
                            }
                        }

                        Text(result.destination)
                            .font(.bodySmall)
                            .foregroundColor(.gray500)
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 2) {
                        Text("\(Int(result.percentage))%")
                            .font(.heading3)
                            .foregroundColor(.forest)

                        Text("\(result.yesCount)/\(result.totalVotes) votes")
                            .font(.caption)
                            .foregroundColor(.gray400)
                    }
                }

                // Progress bar
                CaddyProgressBar(
                    progress: result.percentage / 100,
                    height: 8,
                    foregroundColor: result.isWinner ? .forest : .gray400
                )
            }
        }
    }

    // MARK: - Load Results
    private func loadResults() {
        // Demo data
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            results = [
                VoteResultItem(
                    id: "1",
                    title: "Scottsdale Classic",
                    destination: "Scottsdale, AZ",
                    yesCount: 6,
                    totalVotes: 8,
                    percentage: 75,
                    isWinner: true
                ),
                VoteResultItem(
                    id: "2",
                    title: "Myrtle Beach Value",
                    destination: "Myrtle Beach, SC",
                    yesCount: 4,
                    totalVotes: 8,
                    percentage: 50,
                    isWinner: false
                )
            ]
            isLoading = false
        }
    }
}

// MARK: - Vote Result Item
struct VoteResultItem: Identifiable {
    let id: String
    let title: String
    let destination: String
    let yesCount: Int
    let totalVotes: Int
    let percentage: Double
    let isWinner: Bool
}

#Preview {
    VoteResultsView(tripId: "123", voterName: "John")
}
