'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Users, DollarSign, Loader2, Share2, TrendingUp, ArrowRight, MapPin } from 'lucide-react';
import { SwipeStack } from '@/components/SwipeCard';

interface Course {
  name: string;
  role?: string;
  holes?: number;
}

interface TripOption {
  id: string;
  title: string;
  tagline?: string;
  destination: string;
  destination_name?: string;
  courses: Course[];
  cost_estimate?: {
    per_person_estimated: number;
  };
  cost_per_person?: number;
  why_it_fits: string[];
  score_breakdown?: {
    total: number;
  };
}

interface VoteSummary {
  optionVotes: { [optionId: string]: number };
  voters: { [voterId: string]: string };
  totalVoters: number;
  rankedOptions: { optionId: string; votes: number }[];
  consensus: boolean;
}

interface TripData {
  id: string;
  trip_name: string;
  origin_city: string;
  origin_state: string;
  players: number;
  start_date: string;
  end_date: string;
  nights: number;
  options: TripOption[];
}

export default function VotePage() {
  const params = useParams();
  const tripId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [trip, setTrip] = useState<TripData | null>(null);
  const [options, setOptions] = useState<TripOption[]>([]);
  const [voteSummary, setVoteSummary] = useState<VoteSummary | null>(null);
  const [voterName, setVoterName] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [showSwipe, setShowSwipe] = useState(false);
  const [pendingVotes, setPendingVotes] = useState<{ optionId: string; vote: 'yes' | 'no' }[]>([]);

  useEffect(() => {
    // Check if user has already voted
    const storedVote = localStorage.getItem(`voted_${tripId}`);
    if (storedVote) {
      setHasVoted(true);
      const storedName = localStorage.getItem(`voter_name_${tripId}`);
      if (storedName) setVoterName(storedName);
    }

    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/vote`);
      if (!response.ok) throw new Error('Failed to load trip');

      const result = await response.json();
      if (result.success && result.data) {
        setTrip(result.data.trip);
        // Normalize options format
        const normalizedOptions = result.data.options.map((opt: TripOption) => ({
          ...opt,
          destination: opt.destination || opt.destination_name || 'TBD',
          cost_estimate: opt.cost_estimate || { per_person_estimated: opt.cost_per_person || 0 },
          courses: opt.courses || [],
          why_it_fits: opt.why_it_fits || [],
        }));
        setOptions(normalizedOptions);
        setVoteSummary(result.data.voteSummary);
      }
    } catch (error) {
      console.error('Error loading trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeComplete = useCallback((votes: { optionId: string; vote: 'yes' | 'no' }[]) => {
    setPendingVotes(votes);
    setShowSwipe(false);
  }, []);

  const handleSubmitVotes = async () => {
    if (!voterName.trim() || pendingVotes.length === 0) return;

    const yesVotes = pendingVotes.filter(v => v.vote === 'yes');
    if (yesVotes.length === 0) {
      alert('Please vote YES on at least one option!');
      setShowSwipe(true);
      return;
    }

    setSubmitting(true);
    try {
      // Submit the first yes vote as the preferred option
      const preferredOption = yesVotes[0].optionId;

      const response = await fetch(`/api/trips/${tripId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterName: voterName.trim(),
          preferredOptionId: preferredOption,
          notes: yesVotes.length > 1
            ? `Also interested in: ${yesVotes.slice(1).map(v => {
                const opt = options.find(o => o.id === v.optionId);
                return opt?.title || v.optionId;
              }).join(', ')}`
            : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit vote');

      const result = await response.json();
      if (result.success && result.data) {
        setVoteSummary(result.data.voteSummary);
      }

      setHasVoted(true);
      localStorage.setItem(`voted_${tripId}`, 'true');
      localStorage.setItem(`voter_name_${tripId}`, voterName.trim());

      // Reload to get updated summary
      await loadTrip();
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/vote/${tripId}`;
    navigator.clipboard.writeText(link);
    alert('Link copied! Share it with your group.');
  };

  const startOver = () => {
    setPendingVotes([]);
    setShowSwipe(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h1>
          <p className="text-gray-600">This trip doesn't exist or the link is invalid.</p>
        </div>
      </div>
    );
  }

  const tripName = trip.trip_name || 'Golf Trip';
  const yesVotes = pendingVotes.filter(v => v.vote === 'yes');

  // Show swipe interface
  if (showSwipe && !hasVoted && options.length > 0) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <header className="bg-emerald-700 text-white p-4 flex-shrink-0">
          <h1 className="text-lg font-bold">{tripName}</h1>
          <p className="text-emerald-100 text-sm">
            Swipe right to vote YES, left to skip
          </p>
        </header>
        <div className="flex-1 overflow-hidden">
          <SwipeStack
            options={options}
            onComplete={handleSwipeComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{tripName}</h1>
              <div className="flex items-center gap-2 text-emerald-100">
                <MapPin className="w-4 h-4" />
                <span>{trip.origin_city}, {trip.origin_state}</span>
                <span className="mx-2">•</span>
                <span>{trip.nights} nights</span>
                <span className="mx-2">•</span>
                <span>{trip.players} players</span>
              </div>
            </div>
            <button
              onClick={copyShareLink}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>

          {voteSummary && (
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{voteSummary.totalVoters} voted</span>
              </div>
              {voteSummary.consensus && (
                <div className="flex items-center gap-2 bg-emerald-400/20 px-3 py-1 rounded-full">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Clear favorite!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {!hasVoted ? (
          <>
            {/* Voter Name Input */}
            {!pendingVotes.length && (
              <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Welcome! What's your name?</h2>
                <input
                  type="text"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
                />
                <button
                  onClick={() => voterName.trim() && setShowSwipe(true)}
                  disabled={!voterName.trim()}
                  className="w-full px-6 py-4 bg-emerald-600 text-white rounded-lg font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  Start Voting
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Pending votes review */}
            {pendingVotes.length > 0 && (
              <>
                <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Review Your Selections
                  </h2>
                  <p className="text-gray-600 mb-6">
                    You voted YES on {yesVotes.length} option{yesVotes.length !== 1 ? 's' : ''}:
                  </p>

                  {yesVotes.length === 0 ? (
                    <div className="text-center py-8 bg-red-50 rounded-lg">
                      <p className="text-red-600 font-medium">
                        You didn't vote YES on any options!
                      </p>
                      <button
                        onClick={startOver}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {yesVotes.map((vote, idx) => {
                        const option = options.find(o => o.id === vote.optionId);
                        if (!option) return null;
                        return (
                          <div
                            key={vote.optionId}
                            className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-emerald-600">#{idx + 1}</span>
                              <div>
                                <h3 className="font-bold text-gray-900">{option.title}</h3>
                                <p className="text-sm text-gray-600">{option.destination}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-600">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-bold">
                                {option.cost_estimate?.per_person_estimated || 0}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={startOver}
                    className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition"
                  >
                    Start Over
                  </button>
                  <button
                    onClick={handleSubmitVotes}
                    disabled={yesVotes.length === 0 || submitting}
                    className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit My Vote
                        <CheckCircle2 className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          /* Thank You / Results View */
          <div className="space-y-6">
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanks for voting, {voterName}!</h2>
              <p className="text-gray-600">Your vote has been recorded. Here's how the group is leaning:</p>
            </div>

            {/* Vote Results */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Current Results</h3>
              <div className="space-y-4">
                {voteSummary?.rankedOptions.map((result, idx) => {
                  const option = options.find((o) => o.id === result.optionId);
                  if (!option) return null;

                  const percentage = voteSummary.totalVoters > 0
                    ? Math.round((result.votes / voteSummary.totalVoters) * 100)
                    : 0;

                  const isLeader = idx === 0 && voteSummary.consensus;

                  return (
                    <div
                      key={result.optionId}
                      className={`bg-white rounded-lg p-4 border-2 ${
                        isLeader ? 'border-emerald-500 shadow-lg' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl font-bold ${
                            isLeader ? 'text-emerald-600' : 'text-gray-400'
                          }`}>
                            #{idx + 1}
                          </span>
                          <div>
                            <h4 className="font-bold text-gray-900">{option.title}</h4>
                            <p className="text-sm text-gray-600">{option.destination}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-600">{result.votes} votes</p>
                          <p className="text-sm text-gray-500">{percentage}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            isLeader ? 'bg-emerald-500' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      {isLeader && (
                        <p className="mt-2 text-sm font-medium text-emerald-600 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Group Favorite
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* Options with no votes */}
                {options
                  .filter(o => !voteSummary?.rankedOptions.find(r => r.optionId === o.id))
                  .map((option) => (
                    <div
                      key={option.id}
                      className="bg-white rounded-lg p-4 border border-gray-200 opacity-60"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-900">{option.title}</h4>
                          <p className="text-sm text-gray-600">{option.destination}</p>
                        </div>
                        <p className="text-gray-400">0 votes</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {voteSummary && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Who's Voted ({voteSummary.totalVoters})</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.values(voteSummary.voters).map((name, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share CTA */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white text-center">
              <h3 className="text-xl font-bold mb-2">More friends need to vote?</h3>
              <p className="text-emerald-100 mb-4">Share this link with your group!</p>
              <button
                onClick={copyShareLink}
                className="px-6 py-3 bg-white text-emerald-700 rounded-lg font-bold hover:bg-emerald-50 transition flex items-center gap-2 mx-auto"
              >
                <Share2 className="w-5 h-5" />
                Copy Share Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
