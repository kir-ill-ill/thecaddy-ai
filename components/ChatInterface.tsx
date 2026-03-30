'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePlanningStore } from '@/lib/store';
import { ExtractTripBriefRequest } from '@/lib/types';

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    tripBrief,
    isLoading,
    addMessage,
    updateTripBrief,
    setState,
    setLoading,
    currentState,
  } = usePlanningStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    setLoading(true);

    try {
      // Call extract API
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema_version: '1.0',
          user_message: userMessage,
          chat_context: {
            known_trip_brief: tripBrief || {},
            user_profile: {},
          },
          locale: 'en-US',
          now_date: new Date().toISOString().split('T')[0],
        } as ExtractTripBriefRequest),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Update trip brief
      if (data.trip_brief) {
        updateTripBrief(data.trip_brief);
      }

      // Add assistant response
      const assistantContent = data.follow_up_question
        ? data.follow_up_question
        : 'Got it! Let me help you plan this trip.';

      addMessage({
        role: 'assistant',
        content: assistantContent,
        metadata: {
          trip_brief: data.trip_brief,
          missing_fields: data.missing_fields,
        },
      });

      // Update state
      if (data.missing_fields && data.missing_fields.length > 0) {
        setState('S1_INTAKE');
      } else {
        setState('S2_ASSUMPTIONS');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addMessage({
        role: 'assistant',
        content: `Error: ${errorMessage}. Please check your API key and try again.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOptions = async () => {
    if (!tripBrief || Object.keys(tripBrief).length === 0) {
      addMessage({
        role: 'assistant',
        content: "I need more information about your trip before I can generate options. Let's start planning!",
      });
      return;
    }

    setLoading(true);
    setState('S3_GENERATION');

    addMessage({
      role: 'assistant',
      content: "Consulting the yardage book... Let me line up some options for you.",
    });

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema_version: '1.0',
          trip_brief: tripBrief,
          inventory_context: {
            candidate_destinations: [],
            courses: [],
            lodging: [],
          },
          scoring_weights: {
            budget_fit: 0.25,
            travel_fit: 0.2,
            logistics: 0.2,
            vibe_match: 0.2,
            course_quality_proxy: 0.15,
          },
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Store options - handle both response shapes
      const planOptions = data.data?.options || data.options || [];
      usePlanningStore.setState({ options: planOptions });

      addMessage({
        role: 'assistant',
        content: `I've lined up ${planOptions.length} packages for you! Check them out below.`,
        metadata: { options: planOptions },
      });

      setState('S4_PRESENTATION');
    } catch (error) {
      console.error('Generate options error:', error);
      addMessage({
        role: 'assistant',
        content: 'Lost one in the rough. Give me a second -- please try again.',
      });
      setState('S2_ASSUMPTIONS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🏌️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">
                Let&apos;s Plan Your Golf Trip
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Tell me about your ideal golf trip and I&apos;ll create personalized options for you.
              </p>
              <div className="grid gap-3 max-w-md mx-auto">
                {[
                  'Planning a trip to Scottsdale for 8 guys in May',
                  'Weekend golf trip for 4, $1200/person budget',
                  'Bachelor party golf trip in Florida',
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(example)}
                    className="text-left p-3 bg-sand/30 hover:bg-sand/50 rounded-lg text-sm text-gray-700 transition border border-forest/10"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                  msg.role === 'user'
                    ? 'bg-forest text-white'
                    : 'bg-sand/40 text-gray-900'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-sand/40 rounded-2xl px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-forest/40 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-forest/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-forest/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">Reading the green...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Trip Brief Summary */}
      {tripBrief && Object.keys(tripBrief).length > 0 && (
        <div className="border-t border-forest/10 bg-sand/20">
          <div className="max-w-3xl mx-auto p-4">
            <div className="bg-white border border-forest/10 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase mb-3">Current Plan</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                {tripBrief.origin && (
                  <div>
                    <p className="text-gray-500 mb-1">From</p>
                    <p className="font-semibold text-gray-900">{tripBrief.origin.city}, {tripBrief.origin.state}</p>
                  </div>
                )}
                {tripBrief.party && (
                  <div>
                    <p className="text-gray-500 mb-1">Players</p>
                    <p className="font-semibold text-gray-900">{tripBrief.party.players}</p>
                  </div>
                )}
                {tripBrief.dates && (
                  <div>
                    <p className="text-gray-500 mb-1">Dates</p>
                    <p className="font-semibold text-gray-900">{tripBrief.dates.nights}N</p>
                  </div>
                )}
                {tripBrief.budget && (
                  <div>
                    <p className="text-gray-500 mb-1">Budget</p>
                    <p className="font-semibold text-gray-900">${tripBrief.budget.per_person}</p>
                  </div>
                )}
              </div>
              {currentState === 'S2_ASSUMPTIONS' && (
                <button
                  onClick={handleGenerateOptions}
                  disabled={isLoading}
                  className="mt-4 w-full bg-gold text-forest py-3 rounded-lg font-semibold hover:bg-gold/90 transition disabled:opacity-50"
                >
                  Generate Trip Options →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-forest/10 bg-white">
        <div className="max-w-3xl mx-auto p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your ideal golf trip..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest disabled:opacity-50 text-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gold text-forest px-6 py-3 rounded-xl font-semibold hover:bg-gold/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
