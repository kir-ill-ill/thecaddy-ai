'use client';

import { Suspense, useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Signing you in...');

  useEffect(() => {
    const email = searchParams.get('email');

    if (!email) {
      setStatus('error');
      setMessage('Invalid callback - missing email');
      return;
    }

    // Sign in with magic link (no password needed)
    const performSignIn = async () => {
      try {
        const result = await signIn('credentials', {
          email,
          password: '__MAGIC_LINK__', // Special marker for magic link auth
          redirect: false,
        });

        if (result?.error) {
          setStatus('error');
          setMessage('Failed to sign in. Please try again.');
        } else {
          setStatus('success');
          setMessage('Success! Redirecting to dashboard...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        }
      } catch {
        setStatus('error');
        setMessage('An error occurred. Please try again.');
      }
    };

    performSignIn();
  }, [searchParams, router]);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="w-16 h-16 text-forest animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="w-16 h-16 text-forest mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-2 bg-forest text-white rounded-lg hover:bg-forest/90 transition"
          >
            Back to Login
          </button>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-forest to-forest/90 flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <Loader2 className="w-16 h-16 text-forest animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">Signing you in...</h2>
          </div>
        }
      >
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
