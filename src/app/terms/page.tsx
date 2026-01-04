'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { AppFooter } from '@/components/app-footer';
import { useI18n } from '@/lib/i18n';

export default function TermsPage() {
  const router = useRouter();
  const { t } = useI18n();

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

          <h1 className="text-lg font-medium">{t('terms.title')}</h1>

          <div className="w-9" />
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-muted-foreground flex-1 overflow-y-auto pb-4">
          <p className="text-xs text-muted-foreground/70">{t('terms.lastUpdated')}</p>
          <p>{t('terms.intro')}</p>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.acceptance')}
            </h2>
            <p>{t('terms.acceptanceText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.description')}
            </h2>
            <p>{t('terms.descriptionText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.userResponsibilities')}
            </h2>
            <p>{t('terms.userResponsibilitiesText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.intellectualProperty')}
            </h2>
            <p>{t('terms.intellectualPropertyText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.disclaimer')}
            </h2>
            <p>{t('terms.disclaimerText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.limitation')}
            </h2>
            <p>{t('terms.limitationText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.changes')}
            </h2>
            <p>{t('terms.changesText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.termination')}
            </h2>
            <p>{t('terms.terminationText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.contact')}
            </h2>
            <p>
              {t('terms.contactText')}{' '}
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
