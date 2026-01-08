'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { AppFooter } from '@/components/app-footer';
import { useI18n } from '@/lib/i18n';

export default function MobilePrivacyPage() {
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
            {t('privacy.mobile.title')}
          </h1>

          <div className="w-9" />
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-muted-foreground pb-4">
          <p className="text-xs text-muted-foreground/70">
            {t('privacy.mobile.lastUpdated')}
          </p>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('privacy.mobile.introduction')}
            </h2>
            <p className="mb-4">{t('privacy.mobile.introText')}</p>
            <p className="font-medium text-foreground">
              {t('privacy.mobile.commitment')}
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('privacy.mobile.dontCollect')}
            </h2>
            <p className="mb-3">{t('privacy.mobile.dontCollectIntro')}</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>{t('privacy.mobile.dontCollect1')}</li>
              <li>{t('privacy.mobile.dontCollect2')}</li>
              <li>{t('privacy.mobile.dontCollect3')}</li>
              <li>{t('privacy.mobile.dontCollect4')}</li>
              <li>{t('privacy.mobile.dontCollect5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('privacy.mobile.youCreate')}
            </h2>
            <p className="mb-3">{t('privacy.mobile.youCreateIntro')}</p>
            <div className="space-y-3">
              <div>
                <h3 className="text-foreground font-medium text-sm mb-1">
                  {t('privacy.mobile.emotionalCheckins')}
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                  <li>{t('privacy.mobile.checkin1')}</li>
                  <li>{t('privacy.mobile.checkin2')}</li>
                  <li>{t('privacy.mobile.checkin3')}</li>
                  <li>{t('privacy.mobile.checkin4')}</li>
                </ul>
              </div>
              <div>
                <h3 className="text-foreground font-medium text-sm mb-1">
                  {t('privacy.mobile.appPreferences')}
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                  <li>{t('privacy.mobile.pref1')}</li>
                  <li>{t('privacy.mobile.pref2')}</li>
                  <li>{t('privacy.mobile.pref3')}</li>
                  <li>{t('privacy.mobile.pref4')}</li>
                </ul>
              </div>
            </div>
            <p className="mt-3 font-medium text-foreground">
              {t('privacy.mobile.allDataStays')}
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('privacy.mobile.dataSecurity')}
            </h2>
            <p>{t('privacy.mobile.dataSecurityText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('privacy.mobile.icloudBackup')}
            </h2>
            <p>{t('privacy.mobile.icloudBackupText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('privacy.mobile.noThirdParty')}
            </h2>
            <p className="mb-2">{t('privacy.mobile.noThirdPartyIntro')}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t('privacy.mobile.noThirdParty1')}</li>
              <li>{t('privacy.mobile.noThirdParty2')}</li>
              <li>{t('privacy.mobile.noThirdParty3')}</li>
              <li>{t('privacy.mobile.noThirdParty4')}</li>
              <li>{t('privacy.mobile.noThirdParty5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('privacy.mobile.notifications')}
            </h2>
            <p>{t('privacy.mobile.notificationsText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('privacy.mobile.dataControl')}
            </h2>
            <p className="mb-3">{t('privacy.mobile.dataControlIntro')}</p>
            <div className="space-y-2">
              <div>
                <h3 className="text-foreground font-medium text-sm">
                  {t('privacy.mobile.deleteAll')}
                </h3>
                <p className="text-sm">{t('privacy.mobile.deleteAllText')}</p>
              </div>
              <div>
                <h3 className="text-foreground font-medium text-sm">
                  {t('privacy.mobile.deleteApp')}
                </h3>
                <p className="text-sm">{t('privacy.mobile.deleteAppText')}</p>
              </div>
              <div>
                <h3 className="text-foreground font-medium text-sm">
                  {t('privacy.mobile.noRecovery')}
                </h3>
                <p className="text-sm">{t('privacy.mobile.noRecoveryText')}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('privacy.mobile.yourRights')}
            </h2>
            <p>{t('privacy.mobile.yourRightsText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t('privacy.mobile.changes')}
            </h2>
            <p>{t('privacy.mobile.changesText')}</p>
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

          <section className="border-t border-border pt-4">
            <h2 className="text-foreground font-medium mb-2">
              {t('privacy.mobile.summary')}
            </h2>
            <p className="italic">{t('privacy.mobile.summaryText')}</p>
          </section>
        </div>

        {/* Footer */}
        <AppFooter />
      </div>
    </div>
  );
}
