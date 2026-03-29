'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
        <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-3xl">⛳</span>
              <span className="text-2xl font-bold text-gray-900">TheCaddy.AI</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/trip"
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
              >
                Start Planning
              </Link>
              <Link
                href="/demo-mobile"
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                View Demo
              </Link>
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Plan Your Perfect
            <br />
            <span className="text-emerald-600">Golf Trip in Minutes</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Smart golf trip planning for groups. Get personalized trip options and let your group vote on favorites.
          </p>

          <div className="flex gap-4">
            <Link
              href="/trip"
              className="inline-block px-10 py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition shadow-xl"
            >
              Start Planning →
            </Link>
            <Link
              href="/demo-mobile"
              className="inline-block px-10 py-4 bg-white text-emerald-600 border-2 border-emerald-600 rounded-xl font-bold text-lg hover:bg-emerald-50 transition"
            >
              View Demo
            </Link>
          </div>
        </div>

        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-20"></div>
        </div>
      </div>

      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>© 2025 CaddyAI. Plan your perfect golf trip.</p>
        </div>
      </footer>
    </div>
  );
}
