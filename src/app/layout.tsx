import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { Geist } from 'next/font/google';
import './globals.css';
import { BottomNav } from '@/components/bottom-nav';
import { DesktopNav } from '@/components/desktop-nav';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Recapp',
    default: 'Home | Recapp',
  },
  description: 'Capture your daily moments in beautiful shareable recaps',
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
    <html lang="en" className="bg-neutral-100 dark:bg-neutral-950">
      <body
        className={`${geistSans.variable} font-sans antialiased min-h-screen bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100`}
      >
        <ThemeProvider>
          <LayoutWrapper>
            {/* Desktop Sidebar */}
            <Suspense fallback={null}>
              <DesktopNav />
            </Suspense>

            {/* Main Container */}
            <div className="max-w-md mx-auto lg:ml-64 lg:max-w-none bg-neutral-50 dark:bg-neutral-900 min-h-screen relative [body:has(nav.sidebar-collapsed)_&]:lg:ml-20">
              <main className="min-h-screen">{children}</main>

              {/* Mobile Bottom Nav */}
              <Suspense fallback={null}>
                <BottomNav />
              </Suspense>
            </div>
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
