import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { Geist } from 'next/font/google';
import './globals.css';
import { BottomNav } from '@/components/bottom-nav';
import { DesktopNav } from '@/components/desktop-nav';
import { MainContainer } from '@/components/main-container';
import { Toaster } from '@/components/ui/toaster';
import { FirstRecapCelebration } from '@/components/first-recap-celebration';

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
            <MainContainer>
              {children}

              {/* Mobile Bottom Nav */}
              <Suspense fallback={null}>
                <BottomNav />
              </Suspense>
            </MainContainer>
          </LayoutWrapper>
          <Toaster />
          <FirstRecapCelebration />
        </ThemeProvider>
      </body>
    </html>
  );
}
