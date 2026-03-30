'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DollarSign,
  Users,
  Send,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Copy,
  RefreshCw,
  X,
  Mail,
} from 'lucide-react';

interface FundSummary {
  fund: {
    id: string;
    name: string;
    target_amount_per_person: number | null;
    target_total: number | null;
    fund_type: string;
    description: string | null;
    due_date: string | null;
  };
  requests: {
    id: string;
    email: string;
    name: string | null;
    amount: number;
    request_code: string;
    status: string;
    paid_at: string | null;
  }[];
  payments: {
    id: string;
    payer_email: string;
    payer_name: string;
    amount: number;
    status: string;
    paid_at: string | null;
  }[];
  stats: {
    total_collected: number;
    total_pending: number;
    payment_count: number;
    pending_request_count: number;
    target_amount: number | null;
    progress_percent: number | null;
  };
}

interface NewRequest {
  email: string;
  name: string;
  amount: string;
}

export default function FundManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tripId } = use(params);
  const searchParams = useSearchParams();
  const accessCode = searchParams.get('code');

  const [fundId, setFundId] = useState<string | null>(null);
  const [summary, setSummary] = useState<FundSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Add requests modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRequests, setNewRequests] = useState<NewRequest[]>([
    { email: '', name: '', amount: '' },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch fund data
  useEffect(() => {
    if (!accessCode) {
      setError('Access code required. Please use the link from your email.');
      setIsLoading(false);
      return;
    }

    fetchFundData();
  }, [accessCode, tripId]);

  const fetchFundData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Get fund by trip ID
      const response = await fetch(
        `/api/funds/by-trip/${tripId}?code=${accessCode}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Fund not found. Create one first.');
        }
        throw new Error('Failed to load fund data');
      }

      const data = await response.json();
      if (data.data?.fund?.id) {
        setFundId(data.data.fund.id);
      }
      setSummary(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fund');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRequest = () => {
    setNewRequests([...newRequests, { email: '', name: '', amount: '' }]);
  };

  const handleRemoveRequest = (index: number) => {
    if (newRequests.length > 1) {
      setNewRequests(newRequests.filter((_, i) => i !== index));
    }
  };

  const handleRequestChange = (
    index: number,
    field: keyof NewRequest,
    value: string
  ) => {
    const updated = [...newRequests];
    updated[index][field] = value;
    setNewRequests(updated);
  };

  const handleSendRequests = async () => {
    if (!fundId || !accessCode) return;

    const validRequests = newRequests.filter(
      (r) => r.email && r.amount && parseFloat(r.amount) > 0
    );

    if (validRequests.length === 0) {
      showToast('Please add at least one valid request', 'error');
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(`/api/funds/${fundId}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_code: accessCode,
          requests: validRequests.map((r) => ({
            email: r.email,
            name: r.name || undefined,
            amount: Math.round(parseFloat(r.amount) * 100), // Convert to cents
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment requests');
      }

      // Refresh data and close modal
      await fetchFundData();
      setShowAddModal(false);
      setNewRequests([{ email: '', name: '', amount: '' }]);
      showToast('Payment requests sent successfully!');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send requests', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const copyPaymentLink = (requestCode: string) => {
    const url = `${window.location.origin}/pay/${requestCode}`;
    navigator.clipboard.writeText(url);
    setCopied(requestCode);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-forest mx-auto mb-4" />
          <p className="text-gray-600">Loading fund data...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-sand/30 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Fund</h2>
          <p className="text-gray-600 mb-4">{error || 'Fund data not available'}</p>
          <a
            href={`/trip/${tripId}/fund`}
            className="inline-block px-6 py-3 bg-forest text-white rounded-lg font-medium hover:bg-forest/90"
          >
            Create a Fund
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand/30">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in ${
          toast.type === 'success' ? 'bg-forest text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-forest text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <h1 className="text-xl font-bold font-serif">{summary.fund.name}</h1>
              <p className="text-sm text-sand/70">Captain Dashboard</p>
            </div>
          </div>
          <button
            onClick={fetchFundData}
            className="p-2 text-white/70 hover:bg-white/10 rounded-lg transition"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-forest/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-forest/10 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-forest" />
              </div>
              <span className="text-sm text-gray-500">Collected</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.stats.total_collected)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-forest/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gold/10 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-gold" />
              </div>
              <span className="text-sm text-gray-500">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.stats.total_pending)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-forest/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Paid</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.stats.payment_count}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-forest/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Send className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Waiting</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {summary.stats.pending_request_count}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {summary.stats.target_amount && (
          <div className="bg-white rounded-xl p-6 border border-forest/10 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress to Goal</span>
              <span className="text-sm text-gray-500">
                {formatCurrency(summary.stats.total_collected)} /{' '}
                {formatCurrency(summary.stats.target_amount)}
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-all"
                style={{ width: `${summary.stats.progress_percent || 0}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {summary.stats.progress_percent || 0}% complete
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gold text-forest rounded-lg font-medium hover:bg-gold/90 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Send Payment Requests
          </button>
        </div>

        {/* Payment Requests List */}
        <div className="bg-white rounded-xl border border-forest/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-forest/10">
            <h2 className="text-lg font-bold text-gray-900 font-serif">Payment Requests</h2>
          </div>

          {summary.requests.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No payment requests yet.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-forest font-medium hover:underline"
              >
                Send your first request
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {summary.requests.map((request) => (
                <div
                  key={request.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-sand/20"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        request.status === 'paid'
                          ? 'bg-forest/10'
                          : 'bg-gold/10'
                      }`}
                    >
                      {request.status === 'paid' ? (
                        <CheckCircle2 className="w-5 h-5 text-forest" />
                      ) : (
                        <Clock className="w-5 h-5 text-gold" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.name || request.email}
                      </p>
                      {request.name && (
                        <p className="text-sm text-gray-500">{request.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatCurrency(request.amount)}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          request.status === 'paid' ? 'text-forest' : 'text-gold'
                        }`}
                      >
                        {request.status === 'paid' ? 'Paid' : 'Pending'}
                      </p>
                    </div>

                    {request.status !== 'paid' && (
                      <button
                        onClick={() => copyPaymentLink(request.request_code)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        title="Copy payment link"
                      >
                        {copied === request.request_code ? (
                          <CheckCircle2 className="w-5 h-5 text-forest" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Requests Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-forest/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 font-serif">Send Payment Requests</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {newRequests.map((request, index) => (
                <div
                  key={index}
                  className="bg-sand/30 rounded-lg p-4 relative"
                >
                  {newRequests.length > 1 && (
                    <button
                      onClick={() => handleRemoveRequest(index)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="email"
                      placeholder="Email *"
                      value={request.email}
                      onChange={(e) =>
                        handleRequestChange(index, 'email', e.target.value)
                      }
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/50 focus:border-forest"
                    />
                    <input
                      type="text"
                      placeholder="Name (optional)"
                      value={request.name}
                      onChange={(e) =>
                        handleRequestChange(index, 'name', e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/50 focus:border-forest"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        placeholder="Amount *"
                        min="1"
                        step="0.01"
                        value={request.amount}
                        onChange={(e) =>
                          handleRequestChange(index, 'amount', e.target.value)
                        }
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/50 focus:border-forest"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddRequest}
                className="w-full py-3 border-2 border-dashed border-forest/20 rounded-lg text-gray-500 hover:border-gold hover:text-gold transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Another Person
              </button>
            </div>

            <div className="p-6 border-t border-forest/10 flex gap-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequests}
                disabled={isSending}
                className="flex-1 px-6 py-3 bg-gold text-forest rounded-lg font-medium hover:bg-gold/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Requests
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
