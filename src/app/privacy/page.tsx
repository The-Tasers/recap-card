'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { AppFooter } from '@/components/app-footer';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="h-screen-dynamic bg-background overflow-hidden">
      <div className="max-w-lg mx-auto h-full px-6 pt-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            onClick={() => router.back()}
            className="p-2 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer rounded-md hover:bg-muted/30"
            whileTap={{ scale: 0.95 }}
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>

          <h1 className="text-lg font-medium">Privacy Policy</h1>

          <div className="w-9" />
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-muted-foreground flex-1 overflow-y-auto">
          <section>
            <h2 className="text-foreground font-medium mb-2">Your Data</h2>
            <p>
              Recapz stores your journal entries locally on your device. If you
              create an account, your data syncs to our secure cloud servers to
              enable access across devices.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              What We Collect
            </h2>
            <p>
              We collect only what you provide: your email (for accounts),
              journal entries, mood selections, and any photos you add. We
              don&apos;t track your behavior or sell your data.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">Data Security</h2>
            <p>
              Your data is encrypted in transit and at rest. We use Supabase for
              secure cloud storage with industry-standard security practices.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">Your Rights</h2>
            <p>
              You can delete all your data at any time from the app settings.
              Deleting your account removes all data from our servers
              permanently.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">Contact</h2>
            <p>
              Questions? Reach out at{' '}
              <a
                href="mailto:support@recapz.app"
                className="text-primary hover:underline"
              >
                support@recapz.app
              </a>
            </p>
          </section>
        </div>

        {/* Footer */}
        <AppFooter />
      </div>
    </div>
  );
}
