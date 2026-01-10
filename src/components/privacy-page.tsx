'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { translations, type Language } from '@/lib/i18n/translations';

// Helper to get translation
function t(lang: Language, key: string): string {
  const langTranslations = translations[lang] as Record<string, string> | undefined;
  const enTranslations = translations.en as Record<string, string>;
  return langTranslations?.[key] || enTranslations[key] || key;
}

interface PrivacyPageProps {
  lang: Language;
}

export function PrivacyPageContent({ lang }: PrivacyPageProps) {
  const router = useRouter();

  const getLocalizedPath = (path: string) => {
    return lang === 'en' ? path : `/${lang}${path}`;
  };

  const getHomePath = () => {
    return lang === 'en' ? '/' : `/${lang}`;
  };

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
            {t(lang, 'privacy.mobile.title')}
          </h1>

          <div className="w-9" />
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-muted-foreground pb-4">
          <p className="text-xs text-muted-foreground/70">
            {t(lang, 'privacy.mobile.lastUpdated')}
          </p>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'privacy.mobile.introduction')}
            </h2>
            <p className="mb-4">{t(lang, 'privacy.mobile.introText')}</p>
            <p className="font-medium text-foreground">
              {t(lang, 'privacy.mobile.commitment')}
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'privacy.mobile.dontCollect')}
            </h2>
            <p className="mb-3">{t(lang, 'privacy.mobile.dontCollectIntro')}</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>{t(lang, 'privacy.mobile.dontCollect1')}</li>
              <li>{t(lang, 'privacy.mobile.dontCollect2')}</li>
              <li>{t(lang, 'privacy.mobile.dontCollect3')}</li>
              <li>{t(lang, 'privacy.mobile.dontCollect4')}</li>
              <li>{t(lang, 'privacy.mobile.dontCollect5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'privacy.mobile.youCreate')}
            </h2>
            <p className="mb-3">{t(lang, 'privacy.mobile.youCreateIntro')}</p>
            <div className="space-y-3">
              <div>
                <h3 className="text-foreground font-medium text-sm mb-1">
                  {t(lang, 'privacy.mobile.emotionalCheckins')}
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                  <li>{t(lang, 'privacy.mobile.checkin1')}</li>
                  <li>{t(lang, 'privacy.mobile.checkin2')}</li>
                  <li>{t(lang, 'privacy.mobile.checkin3')}</li>
                  <li>{t(lang, 'privacy.mobile.checkin4')}</li>
                </ul>
              </div>
              <div>
                <h3 className="text-foreground font-medium text-sm mb-1">
                  {t(lang, 'privacy.mobile.appPreferences')}
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                  <li>{t(lang, 'privacy.mobile.pref1')}</li>
                  <li>{t(lang, 'privacy.mobile.pref2')}</li>
                  <li>{t(lang, 'privacy.mobile.pref3')}</li>
                  <li>{t(lang, 'privacy.mobile.pref4')}</li>
                </ul>
              </div>
            </div>
            <p className="mt-3 font-medium text-foreground">
              {t(lang, 'privacy.mobile.allDataStays')}
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'privacy.mobile.dataSecurity')}
            </h2>
            <p>{t(lang, 'privacy.mobile.dataSecurityText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'privacy.mobile.icloudBackup')}
            </h2>
            <p>{t(lang, 'privacy.mobile.icloudBackupText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'privacy.mobile.noThirdParty')}
            </h2>
            <p className="mb-2">{t(lang, 'privacy.mobile.noThirdPartyIntro')}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t(lang, 'privacy.mobile.noThirdParty1')}</li>
              <li>{t(lang, 'privacy.mobile.noThirdParty2')}</li>
              <li>{t(lang, 'privacy.mobile.noThirdParty3')}</li>
              <li>{t(lang, 'privacy.mobile.noThirdParty4')}</li>
              <li>{t(lang, 'privacy.mobile.noThirdParty5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'privacy.mobile.notifications')}
            </h2>
            <p>{t(lang, 'privacy.mobile.notificationsText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'privacy.mobile.dataControl')}
            </h2>
            <p className="mb-3">{t(lang, 'privacy.mobile.dataControlIntro')}</p>
            <div className="space-y-2">
              <div>
                <h3 className="text-foreground font-medium text-sm">
                  {t(lang, 'privacy.mobile.deleteAll')}
                </h3>
                <p className="text-sm">{t(lang, 'privacy.mobile.deleteAllText')}</p>
              </div>
              <div>
                <h3 className="text-foreground font-medium text-sm">
                  {t(lang, 'privacy.mobile.deleteApp')}
                </h3>
                <p className="text-sm">{t(lang, 'privacy.mobile.deleteAppText')}</p>
              </div>
              <div>
                <h3 className="text-foreground font-medium text-sm">
                  {t(lang, 'privacy.mobile.noRecovery')}
                </h3>
                <p className="text-sm">{t(lang, 'privacy.mobile.noRecoveryText')}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'privacy.mobile.yourRights')}
            </h2>
            <p>{t(lang, 'privacy.mobile.yourRightsText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'privacy.mobile.changes')}
            </h2>
            <p>{t(lang, 'privacy.mobile.changesText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'privacy.contact')}
            </h2>
            <p>
              {t(lang, 'privacy.contactText')}{' '}
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
              {t(lang, 'privacy.mobile.summary')}
            </h2>
            <p className="italic">{t(lang, 'privacy.mobile.summaryText')}</p>
          </section>
        </div>

        {/* Footer */}
        <div className="shrink-0 py-6 flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground/40">
            <Link
              href={getHomePath()}
              className="hover:text-muted-foreground transition-colors"
            >
              {t(lang, 'meta.title')}
            </Link>
            <span>·</span>
            <Link
              href={getLocalizedPath('/terms')}
              className="hover:text-muted-foreground transition-colors"
            >
              {t(lang, 'footer.terms')}
            </Link>
            <span>·</span>
            <span>{t(lang, 'landing.copyright')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
