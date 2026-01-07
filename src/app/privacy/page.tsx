'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { AppFooter } from '@/components/app-footer';
import { useI18n } from '@/lib/i18n';

export default function PrivacyPage() {
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

          <h1 className="text-lg font-medium text-foreground">{t('privacy.title')}</h1>

          <div className="w-9" />
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-muted-foreground flex-1 overflow-y-auto pb-4">
          <p className="text-xs text-muted-foreground/70">{t('privacy.lastUpdated')}</p>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('privacy.yourData')}
            </h2>
            <p>{t('privacy.yourDataText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('privacy.whatWeCollect')}
            </h2>
            <p>{t('privacy.whatWeCollectText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('privacy.analytics')}
            </h2>
            <p>{t('privacy.analyticsText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('privacy.dataSecurity')}
            </h2>
            <p>{t('privacy.dataSecurityText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('privacy.yourRights')}
            </h2>
            <p>{t('privacy.yourRightsText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('privacy.contact')}
            </h2>
            <p>
              {t('privacy.contactText')}{' '}
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
