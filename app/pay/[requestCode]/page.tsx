'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface PaymentRequest {
  id: string;
  email: string;
  name: string | null;
  amount: number;
  amount_formatted: string;
  request_code: string;
  status: string;
  fund: {
    id: string;
    name: string;
    description: string | null;
    fund_type: string;
  };
  trip_name: string;
}

export default function PaymentPage({ params }: { params: Promise<{ requestCode: string }> }) {
  const { requestCode } = use(params);
  const searchParams = useSearchParams();
  const cancelled = searchParams.get('cancelled');

  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPaymentRequest();
  }, [requestCode]);

  const fetchPaymentRequest = async () => {
    try {
      const response = await fetch(`/api/payments/${requestCode}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Payment request not found');
      }

      setPaymentRequest(data.data);

      // Pre-fill email if available
      if (data.data.email) {
        setPayerEmail(data.data.email);
      }
      if (data.data.name) {
        setPayerName(data.data.name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment request');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!payerName.trim() || !payerEmail.trim()) {
      alert('Please enter your name and email');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_code: requestCode,
          payer_name: payerName,
          payer_email: payerEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.data?.checkout_url) {
        window.location.href = data.data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Not Found</h2>
          <p className="text-gray-600">{error || 'This payment link is invalid or has expired.'}</p>
        </div>
      </div>
    );
  }

  if (paymentRequest.status === 'paid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Paid!</h2>
          <p className="text-gray-600">
            This payment has already been completed. Thank you!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Cancelled Message */}
        {cancelled && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 text-center">
            Payment was cancelled. You can try again below.
          </div>
        )}

        {/* Payment Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-8 text-white text-center">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8" />
            </div>
            <p className="text-emerald-100 text-sm mb-1">{paymentRequest.trip_name}</p>
            <h1 className="text-2xl font-bold mb-2">{paymentRequest.fund.name}</h1>
            <p className="text-4xl font-bold">{paymentRequest.amount_formatted}</p>
          </div>

          {/* Description */}
          {paymentRequest.fund.description && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <p className="text-gray-600 text-sm text-center">
                {paymentRequest.fund.description}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handlePayment} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Email
              </label>
              <input
                type="email"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full px-6 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirecting to payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay {paymentRequest.amount_formatted}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <Lock className="w-4 h-4" />
              <span>Secure payment powered by Stripe</span>
            </div>
          </form>
        </div>

        {/* Payment methods */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm mb-3">Accepted payment methods</p>
          <div className="flex justify-center gap-2">
            <div className="bg-white px-3 py-2 rounded border border-gray-200 text-xs font-medium text-gray-600">
              Visa
            </div>
            <div className="bg-white px-3 py-2 rounded border border-gray-200 text-xs font-medium text-gray-600">
              Mastercard
            </div>
            <div className="bg-white px-3 py-2 rounded border border-gray-200 text-xs font-medium text-gray-600">
              Amex
            </div>
            <div className="bg-white px-3 py-2 rounded border border-gray-200 text-xs font-medium text-gray-600">
              Apple Pay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
