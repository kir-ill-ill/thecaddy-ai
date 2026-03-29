'use client';

import React, { useState, useEffect } from 'react';
import { Users, Calendar, MapPin, Trophy, Sun, Wind, Bell, Wallet, Plane, CheckCircle, XCircle } from 'lucide-react';

// Mock Data
const ROSTER_DATA = [
  { name: "Commish Dave", hcp: 8.2, status: 'paid', role: 'Commissioner', avatar: 'CD' },
  { name: "Mike Ross", hcp: 12.5, status: 'paid', role: 'Player', avatar: 'MR' },
  { name: "Harvey S.", hcp: 4.1, status: 'paid', role: 'Player', avatar: 'HS' },
  { name: "Louis Litt", hcp: 18.0, status: 'pending', role: 'Player', avatar: 'LL' },
  { name: "Donna P.", hcp: 15.3, status: 'paid', role: 'Player', avatar: 'DP' },
  { name: "Rachel Z.", hcp: 22.1, status: 'pending', role: 'Player', avatar: 'RZ' },
  { name: "Alex W.", hcp: 9.4, status: 'paid', role: 'Player', avatar: 'AW' },
  { name: "Samantha", hcp: 6.7, status: 'paid', role: 'Player', avatar: 'SW' },
  { name: "Robert Z.", hcp: 10.1, status: 'paid', role: 'Player', avatar: 'RZ' },
  { name: "Katrina B.", hcp: 14.2, status: 'pending', role: 'Player', avatar: 'KB' },
  { name: "Jessica P.", hcp: 11.8, status: 'paid', role: 'Player', avatar: 'JP' },
  { name: "Jeff Malone", hcp: 5.5, status: 'paid', role: 'Player', avatar: 'JM' },
];

const WAITLIST_DATA = [
  { name: "Harold G.", hcp: 24.0, avatar: 'HG' },
  { name: "Sheila S.", hcp: 19.5, avatar: 'SS' }
];

const VOTING_DATA = [
  {
    type: 'Course', name: "Troon North (Monument)", location: "Scottsdale, AZ",
    price: "$320/rd", match: "98% Match",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    desc: "Desert target golf at its finest. High difficulty, but pristine conditions.",
    tags: ["Views", "Difficult", "Cart"]
  },
  {
    type: 'Course', name: "We-Ko-Pa (Saguaro)", location: "Fort McDowell, AZ",
    price: "$275/rd", match: "94% Match",
    image: "https://images.unsplash.com/photo-1605257669488-4211e97d2d22?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    desc: "Walkable layout with wide fairways. Better for the high handicappers.",
    tags: ["Walkable", "Value", "Scenic"]
  },
  {
    type: 'Housing', name: "The Cactus Mansion", location: "Paradise Valley",
    price: "$180/pp", match: "99% Match",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    desc: "14 Beds (No bunks). Putting green in backyard. Heated pool.",
    tags: ["14 Beds", "Pool", "Poker"]
  }
];

const ITINERARY_DATA = [
  { time: "08:00 AM", title: "Coffee & Bagels", loc: "The House", type: "food" },
  { time: "09:45 AM", title: "Tee Time: Troon North", loc: "Monument Course", type: "golf", meta: "2-Man Scramble" },
  { time: "02:30 PM", title: "19th Hole Drinks", loc: "Troon Clubhouse", type: "social" },
  { time: "07:00 PM", title: "Steakhouse Dinner", loc: "Mastro's City Hall", type: "food", meta: "Reservation Confirmed" },
];

export default function DemoMobilePage() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentVoteIndex, setCurrentVoteIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (msg: string) => setToast(msg);

  const vote = (direction: string) => {
    setLastDirection(direction);
    showToast(direction === 'left' ? 'Voted: Veto' : 'Voted: Approved');
    setTimeout(() => {
      setCurrentVoteIndex(prev => prev + 1);
      setLastDirection(null);
    }, 300);
  };

  const resetVotes = () => setCurrentVoteIndex(0);

  if (showIntro) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#1A4D2E] flex flex-col items-center justify-center text-[#F5F5DC]">
        <Users className="w-16 h-16 mb-6 animate-bounce" />
        <h1 className="text-4xl font-serif font-bold tracking-wide mb-2">CaddyAI</h1>
        <p className="text-xs uppercase tracking-widest opacity-80">Orchestrating your perfect round</p>
        <div className="mt-12 w-48 h-1 bg-[#F5F5DC]/20 rounded-full overflow-hidden">
          <div className="h-full bg-[#D4AF37] animate-[width-grow_2s_ease-in-out] w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col max-w-md mx-auto bg-gray-50 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <header className="bg-[#1A4D2E] pt-12 pb-6 px-6 shadow-lg relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Users className="w-32 h-32 text-[#F5F5DC]" />
        </div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-[#F5F5DC] text-[10px] font-bold tracking-widest uppercase mb-1">The Commissioner's Desk</h3>
            <h1 className="text-white text-3xl font-serif tracking-wide">CaddyAI</h1>
          </div>
          <div className="bg-[#F5F5DC] p-2 rounded-full shadow-md">
            <Users className="w-5 h-5 text-[#1A4D2E]" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 relative">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <section className="animate-fade-in">
            <div className="m-6 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
              <div className="h-32 relative bg-gray-800">
                <img src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3" className="w-full h-full object-cover opacity-60" alt="Golf Course" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h2 className="text-2xl font-serif font-bold shadow-sm">Scottsdale Scramble '25</h2>
                  <p className="text-xs opacity-90 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> Scottsdale, AZ
                  </p>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center bg-[#F5F5DC]/30">
                <div className="text-center w-1/2">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Countdown</p>
                  <p className="text-xl font-bold text-[#1A4D2E]">142 Days</p>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center w-1/2">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Forecast</p>
                  <p className="text-xl font-bold text-[#1A4D2E] flex items-center justify-center gap-1">
                    <Sun className="w-4 h-4 text-yellow-600" /> 82°
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-6 mb-6 bg-[#1A4D2E]/5 border border-[#1A4D2E]/10 p-3 rounded-lg flex items-center space-x-3">
              <div className="bg-[#1A4D2E] p-2 rounded-full shrink-0">
                <Wind className="w-4 h-4 text-[#F5F5DC]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#1A4D2E] uppercase tracking-wider">The Treasurer</p>
                <p className="text-xs text-gray-600">Collecting Q1 deposits. 3 players pending.</p>
              </div>
            </div>

            <div className="px-6 mb-6">
              <h3 className="text-lg font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#D4AF37]" />
                Commissioner Actions
              </h3>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#D4AF37] flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Approve Itinerary</p>
                    <p className="text-xs text-gray-500">The Scout found 3 new tee times.</p>
                  </div>
                  <button className="bg-[#1A4D2E] text-[#F5F5DC] px-3 py-2 rounded text-[10px] font-bold uppercase hover:bg-green-900 transition">Review</button>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Deposit Deadline</p>
                    <p className="text-xs text-gray-500">3 players have not paid.</p>
                  </div>
                  <button onClick={() => showToast('Nudges sent to 3 players!')} className="bg-white border border-red-500 text-red-500 px-3 py-2 rounded text-[10px] font-bold uppercase hover:bg-red-50 transition">Nudge</button>
                </div>
              </div>
            </div>

            <div className="mx-6 mb-8 bg-[#1A4D2E] rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[#F5F5DC] text-[10px] font-bold uppercase tracking-wider">Total Pot Collected</p>
                    <h2 className="text-3xl font-serif mt-1">$11,250</h2>
                  </div>
                  <Wallet className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                  <div className="bg-[#D4AF37] h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-[10px] opacity-70 text-right">75% of goal ($15,000)</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full pointer-events-none"></div>
            </div>
          </section>
        )}

        {/* Roster */}
        {activeTab === 'roster' && (
          <section className="animate-slide-up px-6 pt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-bold text-gray-800">The Roster</h2>
              <span className="bg-[#1A4D2E] text-white text-[10px] px-3 py-1 rounded-full font-bold">12/12 Full</span>
            </div>
            <p className="text-xs text-gray-600 mb-4 italic">Priority determined by deposit timestamp.</p>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              {ROSTER_DATA.map((user, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-400 w-4">#{idx + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-[#F5F5DC] flex items-center justify-center text-[#1A4D2E] font-bold text-[10px] border border-[#1A4D2E]/20">
                      {user.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-xs flex items-center gap-1">
                        {user.name}
                        {user.role === 'Commissioner' && <Trophy className="w-3 h-3 text-[#D4AF37]" />}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {user.hcp} HCP • <span className={user.status === 'paid' ? 'text-green-600' : 'text-red-500 font-bold'}>{user.status === 'paid' ? 'Paid' : 'Pending'}</span>
                      </p>
                    </div>
                  </div>
                  {user.status === 'pending' && (
                    <button onClick={() => showToast(`Nudge sent to ${user.name}`)} className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100 hover:bg-red-100 transition">Nudge</button>
                  )}
                </div>
              ))}
            </div>

            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-dashed border-red-300"></div></div>
              <span className="relative bg-gray-50 px-4 text-[10px] font-bold text-red-500 uppercase tracking-widest">The Cut Line</span>
            </div>

            <div className="bg-gray-100 rounded-xl border border-gray-200 divide-y divide-gray-200 opacity-80 mb-8">
              {WAITLIST_DATA.map((user, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-400 w-4">#{idx + 13}</span>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-[10px]">
                      {user.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-600 text-xs">{user.name}</p>
                      <p className="text-[10px] text-gray-400">Waitlist • {user.hcp} HCP</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-200 px-2 py-1 rounded">On Deck</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Vote */}
        {activeTab === 'vote' && (
          <section className="h-full flex flex-col px-4 pt-6">
            <div className="text-center mb-4 shrink-0">
              <h2 className="text-2xl font-serif font-bold text-gray-800">Consensus Engine</h2>
              <p className="text-xs text-gray-500">Swipe right to approve, left to veto.</p>
            </div>

            <div className="flex-grow relative flex justify-center items-center w-full">
              {currentVoteIndex < VOTING_DATA.length ? (
                <div className={`w-full max-w-xs bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300 ease-out origin-bottom ${
                  lastDirection === 'left' ? '-translate-x-20 -rotate-6 opacity-0' : lastDirection === 'right' ? 'translate-x-20 rotate-6 opacity-0' : ''
                }`}>
                  <div className="relative h-56">
                    <img src={VOTING_DATA[currentVoteIndex].image} alt="Option" className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full">
                      <span className="text-[10px] font-bold text-[#1A4D2E]">{VOTING_DATA[currentVoteIndex].match}</span>
                    </div>
                    <div className="absolute top-3 left-3 bg-[#1A4D2E] px-2 py-1 rounded-full">
                      <span className="text-[10px] font-bold text-white uppercase">{VOTING_DATA[currentVoteIndex].type}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-serif font-bold text-gray-900 leading-tight">{VOTING_DATA[currentVoteIndex].name}</h3>
                      <span className="text-sm font-bold text-[#1A4D2E] shrink-0 ml-2">{VOTING_DATA[currentVoteIndex].price}</span>
                    </div>
                    <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {VOTING_DATA[currentVoteIndex].location}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {VOTING_DATA[currentVoteIndex].tags.map((tag, i) => (
                        <span key={i} className="bg-[#F5F5DC] text-[#1A4D2E] text-[10px] font-bold uppercase px-2 py-1 rounded">{tag}</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">{VOTING_DATA[currentVoteIndex].desc}</p>
                    <div className="flex justify-center gap-6">
                      <button onClick={() => vote('left')} className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors">
                        <XCircle className="w-6 h-6" />
                      </button>
                      <button onClick={() => vote('right')} className="w-12 h-12 rounded-full bg-[#1A4D2E] text-white flex items-center justify-center shadow-lg hover:bg-green-900 transition-colors">
                        <CheckCircle className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-10">
                  <div className="bg-[#1A4D2E]/10 p-4 rounded-full inline-block mb-4">
                    <CheckCircle className="w-12 h-12 text-[#1A4D2E]" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">All caught up!</h3>
                  <p className="text-gray-500 text-sm">The Commissioner will finalize the itinerary soon.</p>
                  <button onClick={resetVotes} className="mt-4 text-xs text-[#1A4D2E] underline font-bold">Reset Demo</button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Itinerary */}
        {activeTab === 'itinerary' && (
          <section className="animate-slide-up px-6 pt-6">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-gray-800">Trip Timeline</h2>
                <p className="text-sm text-gray-500">Day 2: Saturday, April 13</p>
              </div>
              <button className="bg-[#F5F5DC] text-[#1A4D2E] p-2 rounded-full shadow-sm">
                <Plane className="w-5 h-5" />
              </button>
            </div>

            <div className="relative border-l-2 border-[#1A4D2E]/20 ml-3 space-y-8 my-8 pb-8">
              {ITINERARY_DATA.map((item, idx) => (
                <div key={idx} className="relative pl-8">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${item.type === 'golf' ? 'bg-[#1A4D2E]' : 'bg-[#D4AF37]'}`}></div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">{item.time}</span>
                      {item.type === 'golf' && <Wind className="w-3 h-3 text-gray-400" />}
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg font-serif">{item.title}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" /> {item.loc}
                    </p>
                    {item.meta && (
                      <div className="bg-gray-50 p-2 rounded text-[10px] text-gray-600 font-medium border border-gray-100 inline-block">
                        {item.meta}
                      </div>
                    )}
                    {item.type === 'golf' && (
                      <div className="mt-3 flex gap-2">
                        <button className="flex-1 bg-[#1A4D2E] text-white text-[10px] py-2 rounded font-bold hover:bg-green-900">Course Guide</button>
                        <button className="flex-1 bg-white border border-gray-300 text-gray-700 text-[10px] py-2 rounded font-bold hover:bg-gray-50">Scorecard</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#F5F5DC]/50 p-4 rounded-lg border border-[#F5F5DC] text-center mb-8">
              <p className="text-[#1A4D2E] font-serif italic font-bold text-xs">"Swing easy, hit hard."</p>
            </div>
          </section>
        )}
      </main>

      {/* Tab Bar */}
      <nav className="bg-white border-t border-gray-200 px-6 pb-6 pt-3 flex justify-between items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] shrink-0">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center space-y-1 ${activeTab === 'dashboard' ? 'text-[#1A4D2E]' : 'text-gray-400'} hover:text-[#1A4D2E] transition`}>
          <Trophy className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Scorecard</span>
        </button>
        <button onClick={() => setActiveTab('roster')} className={`flex flex-col items-center space-y-1 ${activeTab === 'roster' ? 'text-[#1A4D2E]' : 'text-gray-400'} hover:text-[#1A4D2E] transition`}>
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Roster</span>
        </button>
        <button onClick={() => setActiveTab('vote')} className={`flex flex-col items-center space-y-1 ${activeTab === 'vote' ? 'text-[#1A4D2E]' : 'text-gray-400'} hover:text-[#1A4D2E] transition`}>
          <CheckCircle className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Vote</span>
        </button>
        <button onClick={() => setActiveTab('itinerary')} className={`flex flex-col items-center space-y-1 ${activeTab === 'itinerary' ? 'text-[#1A4D2E]' : 'text-gray-400'} hover:text-[#1A4D2E] transition`}>
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Itinerary</span>
        </button>
      </nav>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-3 h-3 text-green-400" />
          <span>{toast}</span>
        </div>
      )}

      <style jsx>{`
        @keyframes width-grow {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
