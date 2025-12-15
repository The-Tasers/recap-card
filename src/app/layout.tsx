import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { AppLoader } from '@/components/app-loader';
import { Geist } from 'next/font/google';
import './globals.css';
import { BottomNav } from '@/components/bottom-nav';
import { DesktopNav } from '@/components/desktop-nav';
import { MainContainer } from '@/components/main-container';
import { Toaster } from '@/components/ui/toaster';
import { FirstRecapCelebration } from '@/components/first-recap-celebration';

// Inline script to prevent theme flash - runs before React hydration
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('recap-cards');
    if (stored) {
      var parsed = JSON.parse(stored);
      var theme = parsed.state && parsed.state.theme;
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        }
      }
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    }
  } catch (e) {}
})();
`;

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
    <html
      lang="en"
      className="bg-neutral-100 dark:bg-neutral-950"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} font-sans antialiased min-h-screen bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100`}
      >
        <ThemeProvider>
          <AppLoader>
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
          </AppLoader>
          <Toaster />
          <FirstRecapCelebration />
        </ThemeProvider>
      </body>
    </html>
  );
}
