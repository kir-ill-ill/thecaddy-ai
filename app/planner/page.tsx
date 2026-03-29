'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ChatInterface from '@/components/ChatInterface';
import TripOptionCard from '@/components/TripOptionCard';
import { usePlanningStore } from '@/lib/store';

export default function PlannerPage() {
  const { options, selectedOptions, toggleOptionSelection, currentState } = usePlanningStore();
  const [view, setView] = useState<'chat' | 'options'>('chat');

  React.useEffect(() => {
    if (options.length > 0 && view === 'chat') {
      setView('options');
    }
  }, [options, view]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
              <span className="text-xl">←</span>
              <span className="font-medium">Back</span>
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-2xl">⛳</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Trip Planner</h1>
                <p className="text-xs text-gray-500">{getStateLabel(currentState)}</p>
              </div>
            </div>

            <div className="w-20" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Tab Switcher */}
      {options.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              <button
                onClick={() => setView('chat')}
                className={`py-4 font-medium border-b-2 transition ${
                  view === 'chat'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setView('options')}
                className={`py-4 font-medium border-b-2 transition relative ${
                  view === 'options'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Options
                {options.length > 0 && (
                  <span className="ml-2 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {options.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {view === 'chat' && (
          <div className="h-[calc(100vh-8rem)]">
            <ChatInterface />
          </div>
        )}

        {view === 'options' && options.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Trip Options</h2>
              <p className="text-gray-600">
                Select the option that best fits your group. You can refine details later.
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {options.map((option) => (
                <TripOptionCard
                  key={option.id}
                  option={option}
                  selected={selectedOptions.includes(option.id)}
                  onSelect={() => toggleOptionSelection(option.id)}
                />
              ))}
            </div>

            {selectedOptions.length > 0 && (
              <div className="bg-white border-2 border-emerald-600 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedOptions.length} Option{selectedOptions.length !== 1 ? 's' : ''} Selected
                </h3>
                <p className="text-gray-600 mb-6">
                  Ready to share with your group or continue customizing.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <button className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition">
                    Share with Group
                  </button>
                  <button
                    onClick={() => setView('chat')}
                    className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 transition"
                  >
                    Refine Details
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function getStateLabel(state: string): string {
  const labels: Record<string, string> = {
    S0_START: 'Getting Started',
    S1_INTAKE: 'Gathering Information',
    S2_ASSUMPTIONS: 'Setting Assumptions',
    S3_GENERATION: 'Generating Options',
    S4_PRESENTATION: 'Review Options',
    S5_GROUP_INVITE: 'Group Coordination',
    S6_CONFLICT_RESOLUTION: 'Resolving Conflicts',
    S7_LOCK_PLAN: 'Finalizing Plan',
    S8_BOOKING: 'Ready to Book',
  };
  return labels[state] || 'Planning';
}
