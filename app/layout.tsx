import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'TheCaddy.AI - AI Golf Trip Planner',
  description: 'Plan legendary golf trips in minutes with AI-powered trip planning',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-gray-900">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
