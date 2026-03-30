'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import {
  Plus,
  Calendar,
  Users,
  MapPin,
  DollarSign,
  ChevronRight,
  LogOut,
  User,
  Settings,
  Flag,
  Clock,
  CheckCircle,
  Vote,
  Loader2,
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
  role?: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Clock },
  options_ready: { label: 'Options Ready', color: 'bg-blue-100 text-blue-700', icon: Flag },
  voting: { label: 'Voting', color: 'bg-purple-100 text-purple-700', icon: Vote },
  locked: { label: 'Confirmed', color: 'bg-forest/10 text-forest', icon: CheckCircle },
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchTrips();
    }
  }, [session]);

  // Click-outside handler for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/user/trips');
      if (res.ok) {
        const data = await res.json();
        setTrips(data.trips || []);
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen bg-sand/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-forest animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-sand/30">
      {/* Header */}
      <header className="bg-forest text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Logo size="sm" showText className="text-white" />
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/trip"
                className="flex items-center gap-2 px-4 py-2 bg-gold text-forest rounded-lg hover:bg-gold/90 transition font-medium"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Trip</span>
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>

                {/* Dropdown - click triggered */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-forest/10 z-50">
                    <div className="p-3 border-b border-gray-200">
                      <p className="font-medium text-gray-900 truncate">
                        {session.user.name || 'User'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{session.user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 font-serif">
            Welcome back, {session.user.name?.split(' ')[0] || 'Golfer'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your golf trips and outings from your dashboard
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-forest/10">
            <p className="text-sm text-gray-500">Total Trips</p>
            <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-forest/10">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-forest">
              {trips.filter((t) => t.status !== 'draft').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-forest/10">
            <p className="text-sm text-gray-500">Voting</p>
            <p className="text-2xl font-bold text-purple-600">
              {trips.filter((t) => t.status === 'voting').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-forest/10">
            <p className="text-sm text-gray-500">Confirmed</p>
            <p className="text-2xl font-bold text-gold">
              {trips.filter((t) => t.status === 'locked').length}
            </p>
          </div>
        </div>

        {/* Trips Grid */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 font-serif">Your Trips</h2>
        </div>

        {trips.length === 0 ? (
          <div className="bg-white rounded-2xl border border-forest/10 p-12 text-center">
            <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-forest" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips on the card yet</h3>
            <p className="text-gray-600 mb-6">
              Ready to plan your first? Tell The Caddy what you want.
            </p>
            <Link
              href="/trip"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-forest rounded-lg font-medium hover:bg-gold/90 transition"
            >
              <Plus className="w-5 h-5" />
              Plan Your First Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => {
              const statusInfo = statusConfig[trip.status] || statusConfig.draft;
              const StatusIcon = statusInfo.icon;

              return (
                <Link
                  key={trip.id}
                  href={`/trip/${trip.id}`}
                  className="bg-white rounded-2xl border border-forest/10 hover:border-forest/30 hover:shadow-lg transition-all group"
                >
                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusInfo.label}
                      </span>
                      {trip.role && (
                        <span className="text-xs text-gray-500 capitalize">{trip.role}</span>
                      )}
                    </div>

                    {/* Trip Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-forest transition">
                      {trip.trip_name}
                    </h3>

                    {/* Trip Details */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>
                          From {trip.origin_city}, {trip.origin_state}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{trip.players} players</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span>${trip.budget_per_person}/person budget</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {trip.nights} nights
                      </span>
                      <span className="text-forest text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Add New Trip Card */}
            <Link
              href="/trip"
              className="bg-sand/30 rounded-2xl border-2 border-dashed border-forest/20 hover:border-gold hover:bg-sand/50 transition-all flex items-center justify-center min-h-[280px] group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:bg-gold/10 transition">
                  <Plus className="w-6 h-6 text-gray-400 group-hover:text-gold transition" />
                </div>
                <p className="font-medium text-gray-600 group-hover:text-forest transition">
                  Plan New Trip
                </p>
              </div>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
