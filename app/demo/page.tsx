'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Trophy,
  CheckCircle,
  Calendar,
  MapPin,
  Sun,
  Bell,
  Wallet,
  Wind,
  Plane,
  XCircle,
  Check,
} from 'lucide-react';

// Mock Data
const USERS = [
  { id: 1, name: 'Commish Dave', hcp: 8.2, status: 'paid', role: 'Commissioner', avatar: 'CD' },
  { id: 2, name: 'Mike Ross', hcp: 12.5, status: 'paid', role: 'Player', avatar: 'MR' },
  { id: 3, name: 'Harvey S.', hcp: 4.1, status: 'paid', role: 'Player', avatar: 'HS' },
  { id: 4, name: 'Louis Litt', hcp: 18.0, status: 'pending', role: 'Player', avatar: 'LL' },
  { id: 5, name: 'Donna P.', hcp: 15.3, status: 'paid', role: 'Player', avatar: 'DP' },
  { id: 6, name: 'Rachel Z.', hcp: 22.1, status: 'pending', role: 'Player', avatar: 'RZ' },
];

const WAITLIST = [
  { id: 13, name: 'Harold G.', hcp: 24.0 },
  { id: 14, name: 'Sheila S.', hcp: 19.5 },
];

const VOTING_OPTIONS = [
  {
    id: 1,
    type: 'Course',
    name: 'Troon North (Monument)',
    location: 'Scottsdale, AZ',
    price: '$320/rd',
    match: '98% Match',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3',
    desc: 'Desert target golf at its finest. High difficulty, but pristine conditions.',
    tags: ['Views', 'Difficult', 'Cart'],
  },
  {
    id: 2,
    type: 'Course',
    name: 'We-Ko-Pa (Saguaro)',
    location: 'Fort McDowell, AZ',
    price: '$275/rd',
    match: '94% Match',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3',
    desc: 'Walkable layout with wide fairways. Better for the high handicappers.',
    tags: ['Walkable', 'Value', 'Scenic'],
  },
  {
    id: 3,
    type: 'Housing',
    name: 'The Cactus Mansion',
    location: 'Paradise Valley',
    price: '$180/pp',
    match: '99% Match',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3',
    desc: '14 Beds (No bunks). Putting green in backyard. Heated pool.',
    tags: ['14 Beds', 'Pool', 'Poker'],
  },
];

const ITINERARY = [
  { time: '08:00 AM', title: 'Coffee & Bagels', loc: 'The House', type: 'food' },
  {
    time: '09:45 AM',
    title: 'Tee Time: Troon North',
    loc: 'Monument Course',
    type: 'golf',
    meta: '2-Man Scramble',
  },
  { time: '02:30 PM', title: '19th Hole Drinks', loc: 'Troon Clubhouse', type: 'social' },
  {
    time: '07:00 PM',
    title: 'Steakhouse Dinner',
    loc: "Mastro's City Hall",
    type: 'food',
    meta: 'Reservation Confirmed',
  },
];

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentVoteIndex, setCurrentVoteIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleVote = (direction: 'left' | 'right') => {
    setTimeout(() => {
      if (currentVoteIndex < VOTING_OPTIONS.length - 1) {
        setCurrentVoteIndex(currentVoteIndex + 1);
      }
    }, 300);
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-forest flex flex-col items-center justify-center text-sand">
        <Users size={64} className="mb-6 animate-bounce" />
        <h1 className="text-4xl font-serif font-bold tracking-wide mb-2">CaddyAI</h1>
        <p className="text-sm uppercase tracking-widest opacity-80">
          Orchestrating your perfect round
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 md:max-w-md md:mx-auto md:shadow-2xl md:border-x md:border-gray-200">
      {/* Header */}
      <header className="bg-forest pt-12 pb-6 px-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Users size={120} className="text-sand" />
        </div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-sand text-[10px] font-bold tracking-widest uppercase mb-1">
              The Commissioner&apos;s Desk
            </h3>
            <h1 className="text-white text-3xl font-serif tracking-wide">CaddyAI</h1>
          </div>
          <div className="bg-sand p-2 rounded-full shadow-md">
            <Users size={24} className="text-forest" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-200px)] pb-24">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'roster' && <Roster />}
        {activeTab === 'vote' && <Vote currentIndex={currentVoteIndex} onVote={handleVote} />}
        {activeTab === 'itinerary' && <Itinerary />}
      </main>

      {/* Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 md:left-auto md:right-auto md:max-w-md md:mx-auto bg-white border-t border-gray-200 px-6 pb-6 pt-3 flex justify-between items-center z-50 shadow-lg">
        {[
          { id: 'dashboard', icon: Trophy, label: 'Scorecard' },
          { id: 'roster', icon: Users, label: 'Roster' },
          { id: 'vote', icon: CheckCircle, label: 'Vote' },
          { id: 'itinerary', icon: Calendar, label: 'Itinerary' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === tab.id ? 'text-forest' : 'text-gray-400'
            }`}
          >
            <tab.icon size={24} />
            <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// Components
function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Trip Card */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
        <div className="h-32 relative bg-gray-800">
          <img
            src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3"
            className="w-full h-full object-cover opacity-60"
            alt="Golf Course"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <h2 className="text-2xl font-serif font-bold">Scottsdale Scramble &apos;25</h2>
            <p className="text-xs flex items-center gap-1 mt-1">
              <MapPin size={12} /> Scottsdale, AZ
            </p>
          </div>
        </div>
        <div className="p-4 flex justify-between items-center bg-sand/30">
          <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Countdown</p>
            <p className="text-xl font-bold text-forest">142 Days</p>
          </div>
          <div className="h-8 w-px bg-gray-300"></div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Forecast</p>
            <p className="text-xl font-bold text-forest flex items-center gap-1">
              <Sun size={16} className="text-yellow-600" /> 82°
            </p>
          </div>
        </div>
      </div>

      {/* Agent Status */}
      <div className="bg-forest/5 border border-forest/10 p-3 rounded-lg flex items-center space-x-3">
        <div className="bg-forest p-2 rounded-full">
          <Wind size={16} className="text-sand" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-forest uppercase tracking-wider">
            The Treasurer
          </p>
          <p className="text-xs text-gray-600">Collecting Q1 deposits. 3 players pending.</p>
        </div>
      </div>

      {/* Actions */}
      <div>
        <h3 className="text-lg font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Bell size={18} className="text-gold" />
          Commissioner Actions
        </h3>
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gold flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-800 text-sm">Approve Itinerary</p>
              <p className="text-xs text-gray-500">The Scout found 3 new tee times.</p>
            </div>
            <button className="bg-forest text-sand px-3 py-2 rounded text-[10px] font-bold uppercase">
              Review
            </button>
          </div>
        </div>
      </div>

      {/* Finance Widget */}
      <div className="bg-forest rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sand text-[10px] font-bold uppercase tracking-wider">
                Total Pot Collected
              </p>
              <h2 className="text-3xl font-serif mt-1">$11,250</h2>
            </div>
            <Wallet className="text-gold" />
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 mb-2">
            <div className="bg-gold h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <p className="text-[10px] opacity-70 text-right">75% of goal ($15,000)</p>
        </div>
      </div>
    </div>
  );
}

function Roster() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold text-gray-800">The Roster</h2>
        <span className="bg-forest text-white text-xs px-3 py-1 rounded-full font-bold">
          12/12 Full
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
        {USERS.map((user, idx) => (
          <div key={user.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
              <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-forest font-bold text-xs border border-forest/20">
                {user.avatar}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">
                  {user.name}{' '}
                  {user.role === 'Commissioner' && (
                    <Trophy size={12} className="inline text-gold" />
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {user.hcp} HCP •{' '}
                  <span className={user.status === 'paid' ? 'text-green-600' : 'text-red-500'}>
                    {user.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative my-8 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-dashed border-red-300"></div>
        </div>
        <span className="relative bg-gray-50 px-4 text-xs font-bold text-red-500 uppercase tracking-widest">
          The Cut Line
        </span>
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200 opacity-80">
        {WAITLIST.map((user, idx) => (
          <div key={user.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400">#{idx + 13}</span>
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                {user.name.substring(0, 2)}
              </div>
              <div>
                <p className="font-bold text-gray-600 text-sm">{user.name}</p>
                <p className="text-xs text-gray-400">Waitlist • {user.hcp} HCP</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Vote({
  currentIndex,
  onVote,
}: {
  currentIndex: number;
  onVote: (dir: 'left' | 'right') => void;
}) {
  const card = VOTING_OPTIONS[currentIndex];

  return (
    <div className="h-full p-6 flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-gray-800">Consensus Engine</h2>
        <p className="text-xs text-gray-500">Swipe right to approve, left to veto.</p>
      </div>

      {card ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="relative h-64">
              <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-forest">{card.match}</span>
              </div>
              <div className="absolute top-4 left-4 bg-forest px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-white uppercase">{card.type}</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between mb-2">
                <h3 className="text-xl font-serif font-bold">{card.name}</h3>
                <span className="text-lg font-bold text-forest">{card.price}</span>
              </div>
              <p className="text-gray-500 text-sm mb-4 flex items-center gap-1">
                <MapPin size={14} /> {card.location}
              </p>
              <div className="flex gap-2 mb-4">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-sand text-forest text-[10px] font-bold uppercase px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-6">{card.desc}</p>
              <div className="flex justify-center gap-6">
                <button
                  onClick={() => onVote('left')}
                  className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-500"
                >
                  <XCircle size={28} />
                </button>
                <button
                  onClick={() => onVote('right')}
                  className="w-14 h-14 rounded-full bg-forest text-white flex items-center justify-center shadow-lg"
                >
                  <Check size={28} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-center">
          <div>
            <CheckCircle size={48} className="mx-auto text-forest mb-4" />
            <h3 className="font-bold text-lg">All caught up!</h3>
            <p className="text-gray-500 text-sm">
              The Commissioner will finalize the itinerary soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Itinerary() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-800">Trip Timeline</h2>
          <p className="text-sm text-gray-500">Day 2: Saturday, April 13</p>
        </div>
        <button className="bg-sand text-forest p-2 rounded-full">
          <Plane size={20} />
        </button>
      </div>

      <div className="relative border-l-2 border-forest/20 ml-3 space-y-8">
        {ITINERARY.map((item, idx) => (
          <div key={idx} className="relative pl-8">
            <div
              className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                item.type === 'golf' ? 'bg-forest' : 'bg-gold'
              }`}
            ></div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-gold uppercase">{item.time}</span>
                {item.type === 'golf' && <Wind size={14} className="text-gray-400" />}
              </div>
              <h3 className="font-bold text-gray-800 text-lg font-serif">{item.title}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                <MapPin size={12} /> {item.loc}
              </p>
              {item.meta && (
                <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 font-medium border border-gray-100 inline-block">
                  {item.meta}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-sand/50 p-4 rounded-lg border border-sand text-center">
        <p className="text-forest font-serif italic font-bold text-sm">
          &quot;Swing easy, hit hard.&quot;
        </p>
      </div>
    </div>
  );
}
