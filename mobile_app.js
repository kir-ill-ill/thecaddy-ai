import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Trophy, 
  CreditCard, 
  Wind, 
  Sun, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  ChevronRight,
  Menu,
  Bell,
  ShieldAlert,
  Wallet,
  Plane
} from 'lucide-react';

// --- Mock Data ---

const USERS = [
  { id: 1, name: "Commish Dave", hcp: 8.2, status: 'paid', role: 'Commissioner', avatar: 'CD' },
  { id: 2, name: "Mike Ross", hcp: 12.5, status: 'paid', role: 'Player', avatar: 'MR' },
  { id: 3, name: "Harvey S.", hcp: 4.1, status: 'paid', role: 'Player', avatar: 'HS' },
  { id: 4, name: "Louis Litt", hcp: 18.0, status: 'pending', role: 'Player', avatar: 'LL' },
  { id: 5, name: "Donna P.", hcp: 15.3, status: 'paid', role: 'Player', avatar: 'DP' },
  { id: 6, name: "Rachel Z.", hcp: 22.1, status: 'pending', role: 'Player', avatar: 'RZ' },
  { id: 7, name: "Alex W.", hcp: 9.4, status: 'paid', role: 'Player', avatar: 'AW' },
  { id: 8, name: "Samantha", hcp: 6.7, status: 'paid', role: 'Player', avatar: 'SW' },
  { id: 9, name: "Robert Z.", hcp: 10.1, status: 'paid', role: 'Player', avatar: 'RZ' },
  { id: 10, name: "Katrina B.", hcp: 14.2, status: 'pending', role: 'Player', avatar: 'KB' },
  { id: 11, name: "Jessica P.", hcp: 11.8, status: 'paid', role: 'Player', avatar: 'JP' },
  { id: 12, name: "Jeff Malone", hcp: 5.5, status: 'pending', role: 'Player', avatar: 'JM' },
  // Waitlist
  { id: 13, name: "Harold G.", hcp: 24.0, status: 'waitlist', role: 'Waitlist', avatar: 'HG' },
  { id: 14, name: "Sheila S.", hcp: 19.5, status: 'waitlist', role: 'Waitlist', avatar: 'SS' },
];

const TRIPS = {
  title: "Scottsdale Scramble '25",
  dates: "April 12 - 15, 2025",
  location: "Scottsdale, AZ",
  daysUntil: 142,
  weather: "82° Sunny",
  budgetPerPerson: 1250,
  depositDeadline: "Nov 15, 2024",
};

const VOTING_OPTIONS = [
  {
    id: 1,
    type: 'course',
    name: "Troon North (Monument)",
    location: "Scottsdale, AZ",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    price: "$320/rd",
    match: "98% Match",
    desc: "Desert target golf at its finest. High difficulty, but pristine conditions.",
    tags: ["Views", "Difficult", "Cart Included"]
  },
  {
    id: 2,
    type: 'course',
    name: "We-Ko-Pa (Saguaro)",
    location: "Fort McDowell, AZ",
    image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    price: "$275/rd",
    match: "94% Match",
    desc: "Walkable layout with wide fairways. Better for the high handicappers in the group.",
    tags: ["Walkable", "Value", "Scenic"]
  },
  {
    id: 3,
    type: 'housing',
    name: "The Cactus Mansion",
    location: "Paradise Valley",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    price: "$180/night/pp",
    match: "99% Match",
    desc: "14 Beds (No bunks). Putting green in backyard. Heated pool.",
    tags: ["14 Beds", "Pool", "Poker Table"]
  }
];

const ITINERARY = [
  { time: "08:00 AM", title: "Coffee & Bagels", loc: "The House", type: "food" },
  { time: "09:45 AM", title: "Tee Time: Troon North", loc: "Monument Course", type: "golf", meta: "Format: 2-Man Scramble" },
  { time: "02:30 PM", title: "19th Hole Drinks", loc: "Troon Clubhouse", type: "social" },
  { time: "07:00 PM", title: "Steakhouse Dinner", loc: "Mastro's City Hall", type: "food", meta: "Reservation Confirmed" },
];

// --- Components ---

const Header = () => (
  <div className="bg-[#1A4D2E] pt-12 pb-6 px-6 shadow-lg relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-10">
      <Users size={120} color="#F5F5DC" />
    </div>
    <div className="flex justify-between items-center relative z-10">
      <div>
        <h3 className="text-[#F5F5DC] text-xs font-bold tracking-widest uppercase mb-1">The Commissioner's Desk</h3>
        <h1 className="text-white text-3xl font-serif tracking-wide">CaddyAI</h1>
      </div>
      <div className="bg-[#F5F5DC] p-2 rounded-full shadow-md">
        <Users size={24} className="text-[#1A4D2E]" />
      </div>
    </div>
  </div>
);

const TabBar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', icon: Trophy, label: 'Scorecard' },
    { id: 'roster', icon: Users, label: 'Roster' },
    { id: 'vote', icon: CheckCircle, label: 'Vote' },
    { id: 'itinerary', icon: Calendar, label: 'Itinerary' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-6 pt-3 px-6 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center space-y-1 ${activeTab === tab.id ? 'text-[#1A4D2E]' : 'text-gray-400'}`}
        >
          <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
          <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

const AgentStatus = ({ agent, action }) => (
  <div className="mx-6 mb-6 bg-[#1A4D2E]/5 border border-[#1A4D2E]/10 p-3 rounded-lg flex items-center space-x-3 animate-pulse">
    <div className="bg-[#1A4D2E] p-2 rounded-full">
      <Wind size={16} className="text-[#F5F5DC]" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-[#1A4D2E] uppercase tracking-wider">{agent}</p>
      <p className="text-xs text-gray-600">{action}</p>
    </div>
  </div>
);

// --- Screens ---

const Dashboard = () => {
  return (
    <div className="pb-24">
      {/* Trip Overview Card */}
      <div className="m-6 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
        <div className="h-32 bg-[url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-2xl font-serif font-bold">{TRIPS.title}</h2>
              <p className="text-sm opacity-90 flex items-center justify-center gap-1">
                <MapPin size={14} /> {TRIPS.location}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 flex justify-between items-center bg-[#F5F5DC]/30">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase font-bold">Countdown</p>
            <p className="text-xl font-bold text-[#1A4D2E]">{TRIPS.daysUntil} Days</p>
          </div>
          <div className="h-8 w-px bg-gray-300"></div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase font-bold">Forecast</p>
            <p className="text-xl font-bold text-[#1A4D2E] flex items-center gap-1">
              <Sun size={18} className="text-yellow-600" /> 82°
            </p>
          </div>
        </div>
      </div>

      <AgentStatus agent="The Treasurer" action="Collecting Q1 deposits. 3 players pending." />

      {/* Action Items */}
      <div className="px-6">
        <h3 className="text-lg font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Bell size={18} className="text-[#D4AF37]" />
          Commissioner Actions
        </h3>
        
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#D4AF37] flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-800">Approve Itinerary</p>
              <p className="text-xs text-gray-500">The Scout found 3 new tee times.</p>
            </div>
            <button className="bg-[#1A4D2E] text-[#F5F5DC] px-4 py-2 rounded-md text-xs font-bold uppercase">Review</button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500 flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-800">Deposit Deadline</p>
              <p className="text-xs text-gray-500">3 players have not paid.</p>
            </div>
            <button className="bg-white border border-red-500 text-red-500 px-4 py-2 rounded-md text-xs font-bold uppercase">Nudge</button>
          </div>
        </div>
      </div>

      {/* Financial Snapshot */}
      <div className="m-6 bg-[#1A4D2E] rounded-xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[#F5F5DC] text-xs font-bold uppercase tracking-wider">Total Pot Collected</p>
              <h2 className="text-3xl font-serif">$11,250</h2>
            </div>
            <Wallet className="text-[#D4AF37]" />
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 mb-2">
            <div className="bg-[#D4AF37] h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <p className="text-xs opacity-70 text-right">75% of goal</p>
        </div>
        {/* Decorative background circles */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>
    </div>
  );
};

const Roster = () => {
  return (
    <div className="pb-24 px-6 pt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-gray-800">The Roster</h2>
        <span className="bg-[#1A4D2E] text-white text-xs px-3 py-1 rounded-full font-bold">12/12 Full</span>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Priority is determined by deposit timestamp. Top 12 play.
      </p>

      {/* Active List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
        {USERS.slice(0, 12).map((user, idx) => (
          <div key={user.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 w-4">#{idx + 1}</span>
              <div className="w-10 h-10 rounded-full bg-[#F5F5DC] flex items-center justify-center text-[#1A4D2E] font-bold text-xs border border-[#1A4D2E]/20">
                {user.avatar}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{user.name} {user.role === 'Commissioner' && <Trophy size={12} className="inline text-[#D4AF37] ml-1"/>}</p>
                <p className="text-xs text-gray-500">{user.hcp} HCP • <span className={user.status === 'paid' ? 'text-green-600' : 'text-red-500 font-bold'}>{user.status === 'paid' ? 'Paid' : 'Payment Pending'}</span></p>
              </div>
            </div>
            {user.status === 'pending' && (
              <button className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100">Nudge</button>
            )}
          </div>
        ))}
      </div>

      {/* The Cut Line */}
      <div className="relative my-8 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-dashed border-red-300"></div>
        </div>
        <span className="relative bg-gray-50 px-4 text-xs font-bold text-red-500 uppercase tracking-widest">The Cut Line</span>
      </div>

      {/* Waitlist */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200 opacity-80">
        {USERS.slice(12).map((user, idx) => (
          <div key={user.id} className="p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 w-4">#{idx + 13}</span>
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                {user.avatar}
              </div>
              <div>
                <p className="font-bold text-gray-600 text-sm">{user.name}</p>
                <p className="text-xs text-gray-400">Waitlist • {user.hcp} HCP</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-200 px-2 py-1 rounded">On Deck</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Vote = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState(null);

  const handleVote = (direction) => {
    setLastDirection(direction);
    setTimeout(() => {
      if (currentIndex < VOTING_OPTIONS.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setLastDirection(null);
      } else {
        alert("Voting complete! The Consensus Engine is calculating...");
      }
    }, 300);
  };

  const currentCard = VOTING_OPTIONS[currentIndex];

  return (
    <div className="h-full pb-24 pt-6 px-4 flex flex-col">
      <div className="text-center mb-4">
         <h2 className="text-2xl font-serif font-bold text-gray-800">The Consensus Engine</h2>
         <p className="text-xs text-gray-500">Swipe right to approve, left to veto.</p>
      </div>

      <div className="flex-grow relative flex justify-center items-center">
        {currentCard && (
          <div className={`w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transition-transform duration-300 ${lastDirection === 'left' ? '-translate-x-20 opacity-0 rotate-[-10deg]' : lastDirection === 'right' ? 'translate-x-20 opacity-0 rotate-[10deg]' : ''}`}>
            <div className="relative h-64">
               <img src={currentCard.image} alt={currentCard.name} className="w-full h-full object-cover" />
               <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full">
                 <span className="text-xs font-bold text-[#1A4D2E]">{currentCard.match}</span>
               </div>
               <div className="absolute top-4 left-4 bg-[#1A4D2E] px-3 py-1 rounded-full">
                 <span className="text-xs font-bold text-white uppercase">{currentCard.type}</span>
               </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-serif font-bold text-gray-900">{currentCard.name}</h3>
                <span className="text-lg font-bold text-[#1A4D2E]">{currentCard.price}</span>
              </div>
              <p className="text-gray-500 text-sm mb-4 flex items-center gap-1">
                <MapPin size={14} /> {currentCard.location}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {currentCard.tags.map(tag => (
                  <span key={tag} className="bg-[#F5F5DC] text-[#1A4D2E] text-[10px] font-bold uppercase px-2 py-1 rounded">{tag}</span>
                ))}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                {currentCard.desc}
              </p>

              <div className="flex justify-center gap-6">
                <button 
                  onClick={() => handleVote('left')}
                  className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                >
                  <XCircle size={28} />
                </button>
                <button 
                  onClick={() => handleVote('right')}
                  className="w-14 h-14 rounded-full bg-[#1A4D2E] text-white flex items-center justify-center shadow-lg hover:bg-[#143d24] transition-colors"
                >
                  <CheckCircle size={28} />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {!currentCard && (
            <div className="text-center p-10">
                <CheckCircle size={48} className="mx-auto text-[#1A4D2E] mb-4" />
                <h3 className="font-bold text-lg">All caught up!</h3>
                <p className="text-gray-500 text-sm">The Commissioner will finalize the itinerary soon.</p>
            </div>
        )}
      </div>
    </div>
  );
};

const Itinerary = () => {
  return (
    <div className="pb-24 px-6 pt-6">
      <div className="flex justify-between items-end mb-6">
        <div>
            <h2 className="text-2xl font-serif font-bold text-gray-800">Trip Timeline</h2>
            <p className="text-sm text-gray-500">Day 2: Saturday, April 13</p>
        </div>
        <button className="bg-[#F5F5DC] text-[#1A4D2E] p-2 rounded-full">
            <Plane size={20} />
        </button>
      </div>

      <div className="relative border-l-2 border-[#1A4D2E]/20 ml-3 space-y-8 my-8">
        {ITINERARY.map((item, idx) => (
          <div key={idx} className="relative pl-8">
            {/* Dot */}
            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${item.type === 'golf' ? 'bg-[#1A4D2E]' : 'bg-[#D4AF37]'}`}></div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">{item.time}</span>
                    {item.type === 'golf' && <Wind size={14} className="text-gray-400"/>}
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
                {item.type === 'golf' && (
                    <div className="mt-3 flex gap-2">
                        <button className="flex-1 bg-[#1A4D2E] text-white text-xs py-2 rounded font-bold">Course Guide</button>
                        <button className="flex-1 bg-white border border-gray-300 text-gray-700 text-xs py-2 rounded font-bold">Scorecard</button>
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-[#F5F5DC]/50 p-4 rounded-lg border border-[#F5F5DC] text-center">
        <p className="text-[#1A4D2E] font-serif italic font-bold text-sm">"Swing easy, hit hard."</p>
      </div>
    </div>
  );
};

// --- Main App ---

export default function CaddyAI() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#1A4D2E] flex flex-col items-center justify-center text-[#F5F5DC]">
        <Users size={64} className="mb-6 animate-bounce" />
        <h1 className="text-4xl font-serif font-bold tracking-wide mb-2">CaddyAI</h1>
        <p className="text-sm uppercase tracking-widest opacity-80">Orchestrating your perfect round</p>
        <div className="mt-12 w-48 h-1 bg-[#F5F5DC]/20 rounded-full overflow-hidden">
            <div className="h-full bg-[#D4AF37] animate-[width_2s_ease-in-out] w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 md:max-w-md md:mx-auto md:shadow-2xl md:border-x md:border-gray-200 relative">
      <Header />
      
      <main className="h-full overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'roster' && <Roster />}
        {activeTab === 'vote' && <Vote />}
        {activeTab === 'itinerary' && <Itinerary />}
      </main>

      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}