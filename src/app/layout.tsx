import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { GoogleAnalytics } from '@/components/google-analytics';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Google Analytics Measurement ID - replace with your actual ID
const GA_MEASUREMENT_ID = 'G-VREKFE83N5';

export const metadata: Metadata = {
  title: {
    template: '%s | RECAPZ',
    default: 'RECAPZ - Daily Reflection',
  },
  description:
    'A quiet place for your days. Track your mood, reflect on your day, and discover emotional patterns.',
  keywords: [
    'mood tracker',
    'daily journal',
    'reflection app',
    'mental wellness',
    'emotional awareness',
    'mindfulness',
    'self care',
    'daily recap',
  ],
  authors: [{ name: 'Sponom Dev' }],
  creator: 'Sponom Dev',
  publisher: 'Sponom Dev',
  metadataBase: new URL('https://recapz.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://recapz.app',
    siteName: 'RECAPZ',
    title: 'RECAPZ - Daily Reflection',
    description:
      'A quiet place for your days. Track your mood, reflect on your day, and discover emotional patterns.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RECAPZ - Daily Reflection App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RECAPZ - Daily Reflection',
    description:
      'A quiet place for your days. Track your mood and discover patterns.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-google-verification-code',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white">
      <body
        className={`${geistSans.variable} font-sans antialiased min-h-screen bg-white text-neutral-900`}
      >
        <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
        {children}
      </body>
    </html>
  );
}
