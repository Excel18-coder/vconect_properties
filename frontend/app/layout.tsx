import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/components/auth-provider';

export const metadata: Metadata = {
  title: 'VConnect Properties - Find Your Perfect Home',
  description: 'VConnect Properties is a premium real estate marketplace connecting buyers with verified sellers. Discover apartments, houses, villas, and commercial properties.',
  keywords: 'real estate, property, house, apartment, villa, buy, rent, Kenya, Africa',
  openGraph: {
    title: 'VConnect Properties - Find Your Perfect Home',
    description: 'Premium real estate marketplace connecting buyers with verified sellers.',
    type: 'website',
    images: [
      {
        url: '/images/image.png',
        width: 1200,
        height: 630,
        alt: 'VConnect Properties',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VConnect Properties',
    description: 'Premium real estate marketplace.',
    images: ['/images/image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
