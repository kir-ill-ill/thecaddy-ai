'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Camera,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Shield,
  Trash2,
} from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        await update({ name });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }

    setSaving(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-sand/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-forest animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-sand/30">
      {/* Header */}
      <header className="bg-forest text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sand/80 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 font-serif">Profile Settings</h1>

        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-forest/10 overflow-hidden">
            <div className="p-6 border-b border-forest/10">
              <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage your account information
              </p>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-forest" />
                    </div>
                  )}
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-forest/10 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition"
                  >
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{session.user.name || 'User'}</p>
                  <p className="text-sm text-gray-500">{session.user.email}</p>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/50 focus:border-forest"
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={session.user.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed
                </p>
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-forest text-white rounded-lg font-medium hover:bg-forest/90 transition disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : saved ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Connected Accounts */}
          <div className="bg-white rounded-2xl border border-forest/10 overflow-hidden">
            <div className="p-6 border-b border-forest/10">
              <h2 className="text-lg font-semibold text-gray-900">Connected Accounts</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage your login methods
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Google */}
              <div className="flex items-center justify-between p-4 border border-forest/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Google</p>
                    <p className="text-sm text-gray-500">Sign in with Google</p>
                  </div>
                </div>
                <span className="text-sm text-forest font-medium">Connected</span>
              </div>

              {/* Password */}
              <div className="flex items-center justify-between p-4 border border-forest/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Password</p>
                    <p className="text-sm text-gray-500">Sign in with email & password</p>
                  </div>
                </div>
                <button className="text-sm text-forest font-medium hover:underline">
                  Set Password
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
            <div className="p-6 border-b border-red-200 bg-red-50">
              <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
              <p className="text-sm text-red-700 mt-1">
                Irreversible actions
              </p>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Delete Account</p>
                  <p className="text-sm text-gray-500">
                    Permanently delete your account and all data
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <div className="text-center pt-4">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Sign out of your account
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
