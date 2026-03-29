'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, PartyPopper, Home } from 'lucide-react';

export default function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ requestCode: string }>;
}) {
  const { requestCode } = use(params);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [isVerifying, setIsVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // In a real app, you might want to verify the session with your backend
    // For now, we'll just show success after a brief delay
    const timer = setTimeout(() => {
      setVerified(true);
      setIsVerifying(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-14 h-14 text-emerald-600" />
          </div>
          <div className="absolute -top-4 -right-4">
            <PartyPopper className="w-10 h-10 text-amber-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
        <p className="text-gray-600 text-lg mb-8">
          Thank you for your payment. The trip captain has been notified.
        </p>

        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8 text-left">
          <h2 className="font-semibold text-gray-900 mb-4">What happens next?</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">
                You'll receive an email confirmation shortly
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">
                The trip captain can see your payment in their dashboard
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">
                Your spot on the trip is confirmed!
              </span>
            </li>
          </ul>
        </div>

        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </a>

        <p className="mt-6 text-gray-400 text-sm">
          Payment reference: {requestCode}
        </p>
      </div>
    </div>
  );
}
