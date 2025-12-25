'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { AppFooter } from '@/components/app-footer';

export default function TermsPage() {
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

          <h1 className="text-lg font-medium">Terms of Service</h1>

          <div className="w-9" />
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-muted-foreground flex-1 overflow-y-auto">
          <section>
            <h2 className="text-foreground font-medium mb-2">Using Recapz</h2>
            <p>
              Recapz is a personal journaling app. By using it, you agree to use
              it responsibly and not for any illegal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">Your Content</h2>
            <p>
              You own everything you create in Recapz. We don&apos;t claim any
              rights to your journal entries, photos, or other content.
              You&apos;re responsible for what you write.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">Account</h2>
            <p>
              Keep your login credentials secure. You&apos;re responsible for
              activity on your account. We may suspend accounts that violate
              these terms.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">Service</h2>
            <p>
              We provide Recapz as-is. While we strive for reliability, we
              can&apos;t guarantee uninterrupted service. We may update or
              modify the app at any time.
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
