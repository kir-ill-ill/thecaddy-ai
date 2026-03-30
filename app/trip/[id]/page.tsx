'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  DollarSign,
  Vote,
  Wallet,
  Share2,
  Loader2,
  CheckCircle,
  Clock,
  Flag,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface Trip {
  id: string;
  trip_name: string;
  origin_city: string;
  origin_state: string;
  players: number;
  start_date: string;
  end_date: string;
  nights: number;
  budget_per_person: number;
  status: string;
  share_code: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Clock },
  options_ready: { label: 'Options Ready', color: 'bg-blue-100 text-blue-700', icon: Flag },
  voting: { label: 'Voting Open', color: 'bg-purple-100 text-purple-700', icon: Vote },
  locked: { label: 'Confirmed', color: 'bg-forest/10 text-forest', icon: CheckCircle },
};

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tripId } = use(params);
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard');
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchTrip();
    }
  }, [session, tripId]);

  const fetchTrip = async () => {
    try {
      const res = await fetch('/api/user/trips');
      if (res.ok) {
        const data = await res.json();
        const found = (data.trips || []).find((t: Trip) => t.id === tripId);
        if (found) {
          setTrip(found);
        } else {
          setError('Trip not found');
        }
      } else {
        setError('Failed to load trip');
      }
    } catch {
      setError('Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const copyVoteLink = () => {
    if (trip?.share_code) {
      const link = `${window.location.origin}/vote/${trip.share_code}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-sand/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-forest animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-sand/30 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Trip Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This trip does not exist or you do not have access.'}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-white rounded-lg font-medium hover:bg-forest/90 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[trip.status] || statusConfig.draft;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-sand/30">
      {/* Header */}
      <header className="bg-forest text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sand/80 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex items-start justify-between">
            <div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3 ${statusInfo.color}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {statusInfo.label}
              </span>
              <h1 className="text-3xl font-bold font-serif">{trip.trip_name}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trip Info Card */}
        <div className="bg-white rounded-2xl border border-forest/10 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 font-serif">Trip Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-forest mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">From</p>
                <p className="font-semibold text-gray-900">{trip.origin_city}, {trip.origin_state}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-forest mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Dates</p>
                <p className="font-semibold text-gray-900">{formatDate(trip.start_date)}</p>
                <p className="text-sm text-gray-500">to {formatDate(trip.end_date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-forest mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Group</p>
                <p className="font-semibold text-gray-900">{trip.players} players</p>
                <p className="text-sm text-gray-500">{trip.nights} nights</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-forest mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Budget</p>
                <p className="font-semibold text-gray-900">${trip.budget_per_person}/person</p>
                <p className="text-sm text-gray-500">${trip.budget_per_person * trip.players} total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Vote Link */}
          {trip.share_code && (
            <div className="bg-white rounded-xl border border-forest/10 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Vote className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Group Voting</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Share the vote link with your group to let them weigh in.
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/vote/${trip.share_code}`}
                  className="flex-1 text-center px-4 py-2 bg-forest text-white rounded-lg text-sm font-medium hover:bg-forest/90 transition flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  View
                </Link>
                <button
                  onClick={copyVoteLink}
                  className="px-4 py-2 border border-forest/20 text-forest rounded-lg text-sm font-medium hover:bg-forest/5 transition flex items-center gap-1"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Fund Setup */}
          <div className="bg-white rounded-xl border border-forest/10 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gold/10 p-2 rounded-lg">
                <Wallet className="w-5 h-5 text-gold" />
              </div>
              <h3 className="font-semibold text-gray-900">Trip Fund</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Set up a fund to collect payments from your group.
            </p>
            <Link
              href={`/trip/${tripId}/fund`}
              className="block text-center px-4 py-2 bg-gold text-forest rounded-lg text-sm font-medium hover:bg-gold/90 transition"
            >
              Set Up Fund
            </Link>
          </div>

          {/* Share */}
          <div className="bg-white rounded-xl border border-forest/10 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-forest/10 p-2 rounded-lg">
                <Share2 className="w-5 h-5 text-forest" />
              </div>
              <h3 className="font-semibold text-gray-900">Share Trip</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Need to make changes? Go back to the planner.
            </p>
            <Link
              href="/trip"
              className="block text-center px-4 py-2 border border-forest/20 text-forest rounded-lg text-sm font-medium hover:bg-forest/5 transition"
            >
              Open Planner
            </Link>
          </div>
        </div>

        {/* Created At */}
        <p className="text-center text-xs text-gray-400">
          Trip created {formatDate(trip.created_at)}
        </p>
      </main>
    </div>
  );
}
