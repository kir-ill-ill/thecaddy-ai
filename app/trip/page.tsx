'use client';

import { useState } from 'react';
import { usePlanningStore } from '@/lib/store';
import { Send, Loader2, CheckCircle2, Users, Calendar, DollarSign, Share2, Copy } from 'lucide-react';
import { TripOption } from '@/lib/types';
import Logo from '@/components/Logo';

// Share Trip Button Component
function ShareTripButton({
  tripBrief,
  options,
  selectedOptions,
}: {
  tripBrief: any;
  options: TripOption[];
  selectedOptions: string[];
}) {
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      const selectedOptionsData = options.filter((opt) => selectedOptions.includes(opt.id));

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripBrief,
          options: selectedOptionsData,
          selectedOptions,
          creatorName: 'Trip Organizer',
        }),
      });

      if (!response.ok) throw new Error('Failed to create shareable trip');

      const data = await response.json();
      const fullUrl = `${window.location.origin}${data.shareUrl}`;
      setShareUrl(fullUrl);
    } catch (error) {
      console.error('Error creating share link:', error);
    } finally {
      setSharing(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (shareUrl) {
    return (
      <div className="mt-8 bg-white rounded-xl p-6 border-2 border-forest shadow-lg">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-forest/10 p-3 rounded-full">
            <Share2 className="w-6 h-6 text-forest" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Your Trip is Ready to Share!</h3>
            <p className="text-gray-600 text-sm">Send this link to your group so they can vote on the options.</p>
          </div>
        </div>

        <div className="bg-sand/30 p-4 rounded-lg border border-forest/10 mb-4">
          <p className="text-sm text-gray-600 mb-2">Shareable Link:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
            />
            <button
              onClick={copyLink}
              className="px-4 py-2 bg-forest text-white rounded hover:bg-forest/90 transition flex items-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Anyone with this link can vote. Share it via text, email, or your group chat!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-forest text-white rounded-xl p-6 text-center">
      <h3 className="text-lg font-bold mb-2">Ready to share with your group?</h3>
      <p className="text-sand/80 mb-4">
        You've selected {selectedOptions.length} option(s) for the group to vote on.
      </p>
      <button
        onClick={handleShare}
        disabled={sharing}
        className="px-6 py-3 bg-gold text-forest rounded-lg font-semibold hover:bg-gold/90 transition disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
      >
        {sharing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating Link...
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            Share with Group
          </>
        )}
      </button>
    </div>
  );
}

export default function TripPlannerPage() {
  const [input, setInput] = useState('');
  const {
    currentState,
    messages,
    tripBrief,
    options,
    selectedOptions,
    isLoading,
    currentView,
    addMessage,
    updateTripBrief,
    setOptions,
    toggleOptionSelection,
    setLoading,
    setState,
    setView,
    reset,
  } = usePlanningStore();

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    addMessage({ role: 'user', content: userMessage });
    setLoading(true);

    try {
      // Call extract API
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema_version: '1.0',
          user_message: userMessage,
          chat_context: tripBrief || {},
          locale: 'en-US',
          now_date: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) throw new Error('Failed to extract trip details');

      const data = await response.json();

      // Update trip brief with extracted data
      if (data.trip_brief) {
        updateTripBrief(data.trip_brief);
      }

      // Check if we have enough to build options
      // Required: destination + dates + group size. Budget uses smart default if missing.
      const brief = data.trip_brief || {};
      const hasEnoughInfo = !data.missing_fields || data.missing_fields.length === 0;

      if (hasEnoughInfo) {
        // We have everything -- advance to option generation
        addMessage({
          role: 'assistant',
          content: "I've got what I need. Let me line up some options for your crew.",
        });
        setState('S3_GENERATION');
        setView('options');
        await generateTripOptions(data.trip_brief);
      } else {
        // Still need info -- ask follow-up in caddy voice
        const assistantMessage = data.follow_up_question ||
          `Good start. I still need: ${data.missing_fields.join(', ')}. What are we working with?`;
        addMessage({ role: 'assistant', content: assistantMessage });
        setState('S1_INTAKE');
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage({
        role: 'assistant',
        content: 'Mulligan needed -- let me try that again. Could you rephrase?',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTripOptions = async (brief: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema_version: '1.0',
          trip_brief: brief,
          inventory_context: {},
          scoring_weights: {
            budget_match: 0.3,
            travel_convenience: 0.25,
            course_quality: 0.25,
            group_size_fit: 0.2,
          },
        }),
      });

      const data = await response.json();
      console.log('Plan response data:', data);

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || data.error || 'Failed to generate options');
      }

      const planOptions = data.data?.options || data.options || [];
      console.log('Options from response:', planOptions);
      setOptions(planOptions);
      setState('S4_PRESENTATION');

      addMessage({
        role: 'assistant',
        content: `I've lined up ${planOptions.length} packages for you. Check them out and tell me which ones you like.`,
      });
    } catch (error) {
      console.error('Error generating options:', error);
      addMessage({
        role: 'assistant',
        content: 'Lost one in the rough. Give me a second to find it -- please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Mobile view toggle for when options exist
  const showMobileToggle = options.length > 0;

  return (
    <div className="h-screen flex flex-col bg-sand/20">
      {/* Header */}
      <header className="bg-forest text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div>
              <h1 className="text-xl font-bold font-serif">Plan Your Golf Trip</h1>
              <p className="text-sm text-sand/70">
                {currentState === 'S0_START' && 'Let\'s get started!'}
                {currentState === 'S1_INTAKE' && 'Reading the green...'}
                {currentState === 'S3_GENERATION' && 'Consulting the yardage book...'}
                {currentState === 'S4_PRESENTATION' && 'Review your options'}
              </p>
            </div>
            {(messages.length > 0 || options.length > 0) && (
              <button
                onClick={reset}
                className="ml-4 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded transition"
              >
                Start New Trip
              </button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="hidden md:flex items-center gap-4">
            <div className={`flex items-center gap-2 ${currentState !== 'S0_START' ? 'text-gold' : 'text-white/40'}`}>
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Intake</span>
            </div>
            <div className={`flex items-center gap-2 ${options.length > 0 ? 'text-gold' : 'text-white/40'}`}>
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Options</span>
            </div>
            <div className={`flex items-center gap-2 ${selectedOptions.length > 0 ? 'text-gold' : 'text-white/40'}`}>
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Vote</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile View Toggle */}
      {showMobileToggle && (
        <div className="md:hidden bg-white border-b border-forest/10 flex">
          <button
            onClick={() => setView('chat')}
            className={`flex-1 py-3 text-sm font-medium text-center transition ${
              currentView === 'chat'
                ? 'text-forest border-b-2 border-forest'
                : 'text-gray-500'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setView('options')}
            className={`flex-1 py-3 text-sm font-medium text-center transition relative ${
              currentView !== 'chat'
                ? 'text-forest border-b-2 border-forest'
                : 'text-gray-500'
            }`}
          >
            Options
            {options.length > 0 && (
              <span className="ml-1 bg-gold text-forest text-xs px-2 py-0.5 rounded-full font-bold">
                {options.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className={`${currentView === 'chat' ? 'w-full' : 'hidden md:block md:w-1/2'} border-r border-forest/10 flex flex-col bg-white transition-all`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-forest/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-forest" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-serif mb-2">Start Planning Your Trip</h2>
                <p className="text-gray-600 mb-6">Tell me about your ideal golf trip and I'll help you plan it!</p>

                <div className="space-y-2 max-w-md mx-auto">
                  <p className="text-sm font-medium text-gray-700 text-left">Try saying:</p>
                  {[
                    "I want to plan a golf trip to Scottsdale for 8 guys in May",
                    "Weekend golf trip for 4 people, $1200/person budget",
                    "Bachelor party golf trip in Florida next spring"
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(example)}
                      className="w-full text-left p-3 bg-sand/30 hover:bg-sand/50 rounded-lg text-sm text-gray-700 transition border border-forest/10"
                    >
                      &ldquo;{example}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-forest text-white'
                    : 'bg-sand/40 text-gray-900'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-sand/40 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-forest" />
                  <span className="text-sm text-gray-600">Reading the green...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-forest/10 p-4 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Tell me about your golf trip..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-gold text-forest rounded-lg hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-medium"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Options Panel */}
        {currentView !== 'chat' && (
          <div className="w-full md:w-1/2 bg-sand/20 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 font-serif mb-6">Your Trip Options</h2>

              {options.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-forest/20">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Trip options will appear here once we have all your details.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {options.map((option) => (
                    <div
                      key={option.id}
                      className={`bg-white rounded-xl border-2 transition-all cursor-pointer ${
                        selectedOptions.includes(option.id)
                          ? 'border-forest shadow-lg shadow-forest/10'
                          : 'border-forest/10 hover:border-forest/30 hover:shadow-md'
                      }`}
                      onClick={() => toggleOptionSelection(option.id)}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{option.title}</h3>
                            <p className="text-gray-600">{option.destination}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-forest">
                              <DollarSign className="w-5 h-5" />
                              <span className="text-2xl font-bold">{option.cost_estimate.per_person_estimated}</span>
                            </div>
                            <p className="text-xs text-gray-500">per person</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Courses</h4>
                            <div className="space-y-1">
                              {option.courses.map((course, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                  <Logo size="sm" />
                                  {course.name}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Lodging</h4>
                            <p className="text-sm text-gray-700">{option.lodging.type} in {option.lodging.name_or_area}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Why This Works</h4>
                            <div className="flex flex-wrap gap-2">
                              {option.why_it_fits.map((reason, idx) => (
                                <span key={idx} className="px-3 py-1 bg-forest/10 text-forest rounded-full text-xs font-medium">
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedOptions.includes(option.id) && (
                        <div className="bg-forest/5 px-6 py-3 border-t border-forest/10">
                          <p className="text-sm font-medium text-forest flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Selected for voting
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {options.length > 0 && selectedOptions.length > 0 && (
                <ShareTripButton
                  tripBrief={tripBrief}
                  options={options}
                  selectedOptions={selectedOptions}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
