'use client';

import Link from 'next/link';
import Image from 'next/image';
import { translations, type Language } from '@/lib/i18n/translations';
import { SharedHeader, Logo } from './shared-header';

// Helper to get translation
function t(lang: Language, key: string): string {
  const langTranslations = translations[lang] as unknown as Record<string, string> | undefined;
  const enTranslations = translations.en as unknown as Record<string, string>;
  return langTranslations?.[key] || enTranslations[key] || key;
}

// App Store button component
const APP_STORE_URL = 'https://apps.apple.com/app/recapz-daily-reflection/id6757631286';

function AppStoreButton({ lang }: { lang: Language }) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block hover:opacity-80 transition-opacity"
    >
      <Image
        src={`/app-store-buttons/${lang}.svg`}
        alt="Download on the App Store"
        width={160}
        height={54}
        className="h-[54px] w-auto"
      />
    </a>
  );
}

interface FeaturePageLayoutProps {
  lang: Language;
  children: React.ReactNode;
}

export function FeaturePageLayout({ lang, children }: FeaturePageLayoutProps) {
  const getLocalizedPath = (path: string) => {
    return lang === 'en' ? path : `/${lang}${path}`;
  };

  const homePath = lang === 'en' ? '/' : `/${lang}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header - same as main page */}
      <SharedHeader lang={lang} variant="sticky" maxWidth="6xl" />

      {/* Content */}
      {children}

      {/* Footer */}
      <footer className="py-16 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Logo & Description */}
            <div className="md:col-span-1">
              <Logo size="md" />
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {t(lang, 'footer.tagline')}
              </p>
            </div>
            {/* Features */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">{t(lang, 'footer.features')}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href={getLocalizedPath('/features/mood-tracking')} className="hover:text-foreground transition-colors">
                    {t(lang, 'footer.moodTracking')}
                  </Link>
                </li>
                <li>
                  <Link href={getLocalizedPath('/features/daily-reflection')} className="hover:text-foreground transition-colors">
                    {t(lang, 'footer.dailyReflection')}
                  </Link>
                </li>
                <li>
                  <Link href={getLocalizedPath('/features/mental-wellness')} className="hover:text-foreground transition-colors">
                    {t(lang, 'footer.mentalWellness')}
                  </Link>
                </li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">{t(lang, 'footer.legal')}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href={getLocalizedPath('/privacy')} className="hover:text-foreground transition-colors">
                    {t(lang, 'footer.privacy')}
                  </Link>
                </li>
                <li>
                  <Link href={getLocalizedPath('/terms')} className="hover:text-foreground transition-colors">
                    {t(lang, 'footer.terms')}
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@recapz.app" className="hover:text-foreground transition-colors">
                    {t(lang, 'footer.contact')}
                  </a>
                </li>
              </ul>
            </div>
            {/* Get the App */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">{t(lang, 'footer.download')}</h4>
              <AppStoreButton lang={lang} />
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Sponom Dev. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Made with care for your wellbeing
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Export AppStoreButton for use in feature pages
export { AppStoreButton };
