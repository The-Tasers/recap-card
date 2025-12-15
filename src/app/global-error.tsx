'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">😓</div>
            <h1 className="text-2xl font-bold mb-2">
              Oops, something broke
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              We're sorry about that. Please try refreshing the page.
            </p>
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors"
            >
              Refresh page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
