import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import { ThemeProvider } from '@/components/theme-provider';
import { AppLoader } from '@/components/app-loader';
import { Geist } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SyncProvider } from '@/components/sync-provider';
import { I18nProvider } from '@/lib/i18n';
import { DynamicMetadata } from '@/components/dynamic-metadata';

const GA_MEASUREMENT_ID = 'G-VREKFE83N5';
const isDev = process.env.NODE_ENV === 'development';

// Inline script to prevent theme flash - runs before React hydration
const themeScript = `
(function() {
  try {
    var lightThemes = ['linen', 'sage', 'rose'];
    var stored = localStorage.getItem('recap-cards');
    var colorTheme = 'midnight';
    if (stored) {
      var parsed = JSON.parse(stored);
      colorTheme = (parsed.state && parsed.state.colorTheme) || 'midnight';
    }
    document.documentElement.setAttribute('data-color-theme', colorTheme);
    if (lightThemes.indexOf(colorTheme) !== -1) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-color-theme', 'midnight');
  }
})();
`;

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | RECAPZ',
    default: 'RECAPZ - Daily Reflection',
  },
  description: 'A quiet place for your days',
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
        {!isDev && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} font-sans antialiased min-h-screen-dynamic bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100`}
      >
        <ThemeProvider>
          <I18nProvider>
            <DynamicMetadata />
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
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
