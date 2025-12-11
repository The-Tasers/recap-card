'use client';

import { useRouter } from 'next/navigation';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  const router = useRouter();

  const handleRetry = () => {
    router.refresh();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5 bg-white dark:bg-neutral-900">
      <div className="max-w-md text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <WifiOff className="h-10 w-10 text-neutral-400 dark:text-neutral-600" />
        </div>

        <h1 className="mb-3 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          You&apos;re Offline
        </h1>

        <p className="mb-8 text-neutral-600 dark:text-neutral-400">
          It looks like you&apos;re not connected to the internet. Your recaps
          are saved locally and will sync when you&apos;re back online.
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleRetry}
            className="w-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
          >
            Try Again
          </Button>

          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full"
          >
            Go to Home
          </Button>
        </div>

        <div className="mt-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-900/50">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            💡 You can still view and create recaps while offline. They&apos;ll
            be saved on your device.
          </p>
        </div>
      </div>
    </div>
  );
}
