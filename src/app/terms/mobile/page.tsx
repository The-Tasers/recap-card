'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { AppFooter } from '@/components/app-footer';
import { useI18n } from '@/lib/i18n';

export default function MobileTermsPage() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className="min-h-screen-dynamic bg-background">
      <div className="max-w-2xl mx-auto h-full px-6 pt-8 pb-8 flex flex-col">
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

          <h1 className="text-lg font-medium text-foreground">
            {t('terms.mobile.title')}
          </h1>

          <div className="w-9" />
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-muted-foreground pb-4">
          <p className="text-xs text-muted-foreground/70">
            {t('terms.mobile.lastUpdated')}
          </p>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.mobile.agreement')}
            </h2>
            <p>{t('terms.mobile.agreementText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.mobile.description')}
            </h2>
            <p className="mb-3">{t('terms.mobile.descriptionIntro')}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t('terms.mobile.desc1')}</li>
              <li>{t('terms.mobile.desc2')}</li>
              <li>{t('terms.mobile.desc3')}</li>
              <li>{t('terms.mobile.desc4')}</li>
              <li>{t('terms.mobile.desc5')}</li>
            </ul>
            <p className="mt-3 font-medium text-foreground">
              {t('terms.mobile.notMedical')}
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.mobile.eligibility')}
            </h2>
            <p>{t('terms.mobile.eligibilityText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.mobile.license')}
            </h2>
            <p className="mb-3">{t('terms.mobile.licenseGrant')}</p>
            <p className="mb-2 font-medium text-foreground">
              {t('terms.mobile.restrictions')}
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t('terms.mobile.restrict1')}</li>
              <li>{t('terms.mobile.restrict2')}</li>
              <li>{t('terms.mobile.restrict3')}</li>
              <li>{t('terms.mobile.restrict4')}</li>
              <li>{t('terms.mobile.restrict5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.mobile.userContent')}
            </h2>
            <p className="mb-3">{t('terms.mobile.yourData')}</p>
            <p className="mb-3">{t('terms.mobile.localStorage')}</p>
            <p className="mb-2 font-medium text-foreground">
              {t('terms.mobile.yourResponsibility')}
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t('terms.mobile.resp1')}</li>
              <li>{t('terms.mobile.resp2')}</li>
              <li>{t('terms.mobile.resp3')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.mobile.intellectualProperty')}
            </h2>
            <p>{t('terms.mobile.intellectualPropertyText')}</p>
          </section>

          <section className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50 dark:bg-yellow-950/20">
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.mobile.noMedicalAdvice')}
            </h2>
            <p className="mb-3 font-medium text-foreground">
              {t('terms.mobile.notSubstitute')}
            </p>
            <p className="mb-3">{t('terms.mobile.notSubstituteText')}</p>
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded">
              <p className="font-medium text-foreground mb-2">
                {t('terms.mobile.emergency')}
              </p>
              <p className="text-sm">{t('terms.mobile.emergencyText')}</p>
            </div>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.mobile.disclaimers')}
            </h2>
            <p className="mb-3">{t('terms.mobile.disclaimersAsIs')}</p>
            <p>{t('terms.mobile.disclaimersNoGuarantee')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.mobile.limitation')}
            </h2>
            <p>{t('terms.mobile.limitationText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.mobile.updates')}
            </h2>
            <p>{t('terms.mobile.updatesText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.mobile.appStore')}
            </h2>
            <p>{t('terms.mobile.appStoreText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.mobile.privacyRef')}
            </h2>
            <p>{t('terms.mobile.privacyRefText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.mobile.termination')}
            </h2>
            <p>{t('terms.mobile.terminationText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.mobile.contact')}
            </h2>
            <p>
              {t('terms.mobile.contactText')}{' '}
              <a
                href="mailto:support@recapz.app"
                className="text-primary hover:underline"
              >
                support@recapz.app
              </a>
            </p>
          </section>

          <section className="border-t border-border pt-4">
            <h2 className="text-foreground font-medium mb-2">
              {t('terms.mobile.summary')}
            </h2>
            <p className="italic">{t('terms.mobile.summaryText')}</p>
          </section>
        </div>

        {/* Footer */}
        <AppFooter />
      </div>
    </div>
  );
}
