import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { AppLoader } from '@/components/app-loader';
import { Geist } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SyncProvider } from '@/components/sync-provider';

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
    default: 'Recapp',
  },
  description: 'Notice your day, one moment at a time',
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
      className="bg-white dark:bg-neutral-950"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} font-sans antialiased min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100`}
      >
        <AuthProvider>
          <ThemeProvider>
            <SyncProvider>
              <AppLoader>
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center min-h-screen text-muted-foreground">
                      Loading...
                    </div>
                  }
                >
                  {children}
                </Suspense>
              </AppLoader>
              <Toaster />
            </SyncProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
