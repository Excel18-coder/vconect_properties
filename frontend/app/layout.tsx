import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/components/auth-provider';

export const metadata: Metadata = {
  title: 'Vconect - Find Your Perfect Home',
  description: 'Vconect is a premium real estate marketplace connecting buyers with verified sellers. Discover apartments, houses, villas, and commercial properties.',
  keywords: 'real estate, property, house, apartment, villa, buy, rent, Kenya, Africa',
  icons: {
    icon: '/images/vconect-logo.png',
    apple: '/images/vconect-logo.png',
  },
  openGraph: {
    title: 'Vconect - Find Your Perfect Home',
    description: 'Premium real estate marketplace connecting buyers with verified sellers.',
    type: 'website',
    images: [
      {
        url: '/images/vconect-logo.png',
        width: 768,
        height: 768,
        alt: 'Vconect',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vconect',
    description: 'Premium real estate marketplace.',
    images: ['/images/vconect-logo.png'],
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
