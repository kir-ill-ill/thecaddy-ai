'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Users,
  Wallet,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Copy,
  Calendar,
} from 'lucide-react';

interface FundSetupData {
  fund_type: 'dues' | 'shared' | 'both';
  name: string;
  target_amount_per_person: number | null;
  target_total: number | null;
  description: string;
  due_date: string;
  captain_email: string;
}

export default function FundSetupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tripId } = use(params);
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{
    fund_id: string;
    captain_access_code: string;
    manage_url: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<FundSetupData>({
    fund_type: 'dues',
    name: 'Trip Fund',
    target_amount_per_person: null,
    target_total: null,
    description: '',
    due_date: '',
    captain_email: '',
  });

  const handleFundTypeSelect = (type: 'dues' | 'shared' | 'both') => {
    setFormData({ ...formData, fund_type: type });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Convert dollars to cents
      const payload = {
        trip_id: tripId,
        name: formData.name,
        fund_type: formData.fund_type,
        target_amount_per_person: formData.target_amount_per_person
          ? Math.round(formData.target_amount_per_person * 100)
          : undefined,
        target_total: formData.target_total
          ? Math.round(formData.target_total * 100)
          : undefined,
        description: formData.description || undefined,
        due_date: formData.due_date || undefined,
        captain_email: formData.captain_email,
      };

      const response = await fetch('/api/funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create fund');
      }

      setSuccess({
        fund_id: data.data.fund.id,
        captain_access_code: data.data.captain_access_code,
        manage_url: data.data.manage_url,
      });
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const copyAccessCode = () => {
    if (success) {
      navigator.clipboard.writeText(success.captain_access_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const goToManage = () => {
    if (success) {
      router.push(success.manage_url);
    }
  };

  return (
    <div className="min-h-screen bg-sand/30">
      {/* Header */}
      <header className="bg-forest text-white px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <h1 className="text-xl font-bold font-serif">Set Up Trip Fund</h1>
              <p className="text-sm text-sand/70">Collect payments from your group</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {[
            { num: 1, label: 'Fund Type' },
            { num: 2, label: 'Details' },
            { num: 3, label: 'Complete' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s.num
                    ? 'bg-forest text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
              </div>
              <span
                className={`text-sm font-medium ${
                  step >= s.num ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Fund Type Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6 font-serif">
              What type of fund do you need?
            </h2>

            <div className="grid gap-4">
              <button
                onClick={() => handleFundTypeSelect('dues')}
                className="bg-white p-6 rounded-xl border-2 border-forest/10 hover:border-gold transition text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-forest/10 p-3 rounded-full">
                    <Users className="w-6 h-6 text-forest" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Per-Person Dues</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Each person owes a fixed amount. Great for splitting costs evenly.
                    </p>
                    <p className="text-forest text-sm font-medium mt-2">
                      Example: $500 per person
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleFundTypeSelect('shared')}
                className="bg-white p-6 rounded-xl border-2 border-forest/10 hover:border-gold transition text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-gold/10 p-3 rounded-full">
                    <Wallet className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Shared Fund</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Collect a total amount with flexible contributions.
                    </p>
                    <p className="text-gold text-sm font-medium mt-2">
                      Example: $5000 total goal
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleFundTypeSelect('both')}
                className="bg-white p-6 rounded-xl border-2 border-forest/10 hover:border-gold transition text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Both</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Set per-person dues and allow extra contributions.
                    </p>
                    <p className="text-purple-600 text-sm font-medium mt-2">
                      Example: $500 per person + tip jar
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Fund Details Form */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-forest/10">
              <h2 className="text-xl font-bold text-gray-900 mb-6 font-serif">Fund Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fund Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/50 focus:border-forest"
                    placeholder="e.g., Scottsdale Golf Trip"
                  />
                </div>

                {(formData.fund_type === 'dues' || formData.fund_type === 'both') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Per Person ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.target_amount_per_person || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            target_amount_per_person: e.target.value
                              ? parseFloat(e.target.value)
                              : null,
                          })
                        }
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/50 focus:border-forest"
                        placeholder="500"
                        required={formData.fund_type === 'dues'}
                      />
                    </div>
                  </div>
                )}

                {(formData.fund_type === 'shared' || formData.fund_type === 'both') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Fund Goal ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.target_total || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            target_total: e.target.value ? parseFloat(e.target.value) : null,
                          })
                        }
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/50 focus:border-forest"
                        placeholder="5000"
                        required={formData.fund_type === 'shared'}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/50 focus:border-forest"
                    placeholder="What's this fund for? Any notes for the group?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date (Optional)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/50 focus:border-forest"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-forest/10">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-serif">Your Email</h2>
              <p className="text-gray-600 text-sm mb-4">
                We&apos;ll send you a secure link to manage the fund.
              </p>
              <input
                type="email"
                value={formData.captain_email}
                onChange={(e) => setFormData({ ...formData, captain_email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/50 focus:border-forest"
                placeholder="your@email.com"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gold text-forest rounded-lg font-medium hover:bg-gold/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Fund...
                  </>
                ) : (
                  <>
                    Create Fund
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && success && (
          <div className="text-center">
            <div className="bg-forest/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-forest" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Fund Created!</h2>
            <p className="text-gray-600 mb-8">
              Your trip fund is ready. Save your access code to manage it.
            </p>

            <div className="bg-white rounded-xl p-6 border-2 border-gold mb-6">
              <p className="text-sm font-medium text-gray-500 mb-2">Your Captain Access Code</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-lg font-mono bg-sand/30 px-4 py-2 rounded">
                  {success.captain_access_code}
                </code>
                <button
                  onClick={copyAccessCode}
                  className="p-2 bg-sand/30 rounded hover:bg-sand/50 transition"
                >
                  {copied ? (
                    <CheckCircle2 className="w-5 h-5 text-forest" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-red-600 mt-3">
                Save this code! You&apos;ll need it to manage your fund.
              </p>
            </div>

            <button
              onClick={goToManage}
              className="w-full px-6 py-4 bg-forest text-white rounded-lg font-medium hover:bg-forest/90 transition flex items-center justify-center gap-2"
            >
              Go to Fund Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
