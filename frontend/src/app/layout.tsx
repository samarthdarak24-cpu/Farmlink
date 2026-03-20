import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });

export const metadata: Metadata = {
  title: 'ODOP Connect - AI-Powered Agricultural Marketplace',
  description: 'Connect farmers directly with buyers. Eliminate middlemen with blockchain traceability and AI-powered pricing.',
  keywords: ['agriculture', 'marketplace', 'farmers', 'buyers', 'blockchain', 'AI'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'glass-card',
              duration: 4000,
              style: {
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(12px)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}