'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { translations, type Language } from '@/lib/i18n/translations';

// Helper to get translation
function t(lang: Language, key: string): string {
  const langTranslations = translations[lang] as unknown as Record<string, string> | undefined;
  const enTranslations = translations.en as unknown as Record<string, string>;
  return langTranslations?.[key] || enTranslations[key] || key;
}

interface TermsPageProps {
  lang: Language;
}

export function TermsPageContent({ lang }: TermsPageProps) {
  const router = useRouter();

  const getLocalizedPath = (path: string) => {
    return lang === 'en' ? path : `/${lang}${path}`;
  };

  const getHomePath = () => {
    return lang === 'en' ? '/' : `/${lang}`;
  };

  return (
    <div className="min-h-screen bg-background">
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
            {t(lang, 'terms.mobile.title')}
          </h1>

          <div className="w-9" />
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-muted-foreground pb-4">
          <p className="text-xs text-muted-foreground/70">
            {t(lang, 'terms.mobile.lastUpdated')}
          </p>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'terms.mobile.agreement')}
            </h2>
            <p>{t(lang, 'terms.mobile.agreementText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'terms.mobile.description')}
            </h2>
            <p className="mb-3">{t(lang, 'terms.mobile.descriptionIntro')}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t(lang, 'terms.mobile.desc1')}</li>
              <li>{t(lang, 'terms.mobile.desc2')}</li>
              <li>{t(lang, 'terms.mobile.desc3')}</li>
              <li>{t(lang, 'terms.mobile.desc4')}</li>
              <li>{t(lang, 'terms.mobile.desc5')}</li>
            </ul>
            <p className="mt-3 font-medium text-foreground">
              {t(lang, 'terms.mobile.notMedical')}
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'terms.mobile.eligibility')}
            </h2>
            <p>{t(lang, 'terms.mobile.eligibilityText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'terms.mobile.license')}
            </h2>
            <p className="mb-3">{t(lang, 'terms.mobile.licenseGrant')}</p>
            <p className="mb-2 font-medium text-foreground">
              {t(lang, 'terms.mobile.restrictions')}
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t(lang, 'terms.mobile.restrict1')}</li>
              <li>{t(lang, 'terms.mobile.restrict2')}</li>
              <li>{t(lang, 'terms.mobile.restrict3')}</li>
              <li>{t(lang, 'terms.mobile.restrict4')}</li>
              <li>{t(lang, 'terms.mobile.restrict5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'terms.mobile.userContent')}
            </h2>
            <p className="mb-3">{t(lang, 'terms.mobile.yourData')}</p>
            <p className="mb-3">{t(lang, 'terms.mobile.localStorage')}</p>
            <p className="mb-2 font-medium text-foreground">
              {t(lang, 'terms.mobile.yourResponsibility')}
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t(lang, 'terms.mobile.resp1')}</li>
              <li>{t(lang, 'terms.mobile.resp2')}</li>
              <li>{t(lang, 'terms.mobile.resp3')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'terms.mobile.intellectualProperty')}
            </h2>
            <p>{t(lang, 'terms.mobile.intellectualPropertyText')}</p>
          </section>

          <section className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50">
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'terms.mobile.noMedicalAdvice')}
            </h2>
            <p className="mb-3 font-medium text-foreground">
              {t(lang, 'terms.mobile.notSubstitute')}
            </p>
            <p className="mb-3">{t(lang, 'terms.mobile.notSubstituteText')}</p>
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
              <p className="font-medium text-foreground mb-2">
                {t(lang, 'terms.mobile.emergency')}
              </p>
              <p className="text-sm">{t(lang, 'terms.mobile.emergencyText')}</p>
            </div>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'terms.mobile.disclaimers')}
            </h2>
            <p className="mb-3">{t(lang, 'terms.mobile.disclaimersAsIs')}</p>
            <p>{t(lang, 'terms.mobile.disclaimersNoGuarantee')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'terms.mobile.limitation')}
            </h2>
            <p>{t(lang, 'terms.mobile.limitationText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'terms.mobile.updates')}
            </h2>
            <p>{t(lang, 'terms.mobile.updatesText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'terms.mobile.appStore')}
            </h2>
            <p>{t(lang, 'terms.mobile.appStoreText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'terms.mobile.privacyRef')}
            </h2>
            <p>{t(lang, 'terms.mobile.privacyRefText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'terms.mobile.termination')}
            </h2>
            <p>{t(lang, 'terms.mobile.terminationText')}</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">
              {t(lang, 'terms.mobile.contact')}
            </h2>
            <p>
              {t(lang, 'terms.mobile.contactText')}{' '}
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
              {t(lang, 'terms.mobile.summary')}
            </h2>
            <p className="italic">{t(lang, 'terms.mobile.summaryText')}</p>
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
              href={getLocalizedPath('/privacy')}
              className="hover:text-muted-foreground transition-colors"
            >
              {t(lang, 'footer.privacy')}
            </Link>
            <span>·</span>
            <span>{t(lang, 'landing.copyright')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
