import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // Enable offline mode in development with DEBUG_OFFLINE=true
  disable:
    process.env.NODE_ENV === 'development' &&
    process.env.DEBUG_OFFLINE !== 'true',
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offlineCache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
          networkTimeoutSeconds: 10,
        },
      },
    ],
    // Configure offline fallback
    navigateFallback: '/offline',
    navigateFallbackDenylist: [
      /^\/_next\//, // Don't fallback for Next.js internal routes
      /^\/api\//, // Don't fallback for API routes
    ],
  },
});

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withPWA(nextConfig);
