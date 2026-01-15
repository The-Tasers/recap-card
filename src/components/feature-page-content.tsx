'use client';

import { FeaturePageLayout, AppStoreButton } from '@/components/feature-page-layout';
import type { Language } from '@/lib/i18n/translations';
import { getFeatureTranslation, type FeatureType } from '@/lib/i18n/features';
import { Lock, Clock, Palette, Sparkles } from 'lucide-react';

interface FeaturePageContentProps {
  lang: Language;
  feature: FeatureType;
}

export function FeaturePageContent({ lang, feature }: FeaturePageContentProps) {
  const t = getFeatureTranslation(lang, feature);

  switch (feature) {
    case 'moodTracking':
      return <MoodTrackingLayout lang={lang} t={t} />;
    case 'dailyReflection':
      return <DailyReflectionLayout lang={lang} t={t} />;
    case 'mentalWellness':
      return <MentalWellnessLayout lang={lang} t={t} />;
    default:
      return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MoodTrackingLayout({ lang, t }: { lang: Language; t: any }) {
  return (
    <FeaturePageLayout lang={lang}>
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t.heroTitle}</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">{t.heroDesc}</p>
          <AppStoreButton lang={lang} />
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-8">{t.whyTitle}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">{t.why1Title}</h3>
              <p className="text-muted-foreground">{t.why1Desc}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">{t.why2Title}</h3>
              <p className="text-muted-foreground">{t.why2Desc}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">{t.why3Title}</h3>
              <p className="text-muted-foreground">{t.why3Desc}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">{t.why4Title}</h3>
              <p className="text-muted-foreground">{t.why4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-6">{t.privacyTitle}</h2>
          <p className="text-lg text-muted-foreground mb-6">{t.privacyDesc}</p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-center gap-3">
              <span className="text-green-500">✓</span>
              {t.privacy1}
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-500">✓</span>
              {t.privacy2}
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-500">✓</span>
              {t.privacy3}
            </li>
          </ul>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">{t.ctaTitle}</h2>
          <p className="text-lg text-muted-foreground mb-8">{t.ctaDesc}</p>
          <AppStoreButton lang={lang} />
        </div>
      </section>
    </FeaturePageLayout>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DailyReflectionLayout({ lang, t }: { lang: Language; t: any }) {
  return (
    <FeaturePageLayout lang={lang}>
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t.heroTitle}</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">{t.heroDesc}</p>
          <AppStoreButton lang={lang} />
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-8">{t.whyFailTitle}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-background rounded-xl border border-border/50">
              <h3 className="text-xl font-semibold mb-3 text-red-500">✕ {t.fail1Title}</h3>
              <p className="text-muted-foreground">{t.fail1Desc}</p>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border/50">
              <h3 className="text-xl font-semibold mb-3 text-red-500">✕ {t.fail2Title}</h3>
              <p className="text-muted-foreground">{t.fail2Desc}</p>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border/50">
              <h3 className="text-xl font-semibold mb-3 text-red-500">✕ {t.fail3Title}</h3>
              <p className="text-muted-foreground">{t.fail3Desc}</p>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border/50">
              <h3 className="text-xl font-semibold mb-3 text-red-500">✕ {t.fail4Title}</h3>
              <p className="text-muted-foreground">{t.fail4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-8">{t.approachTitle}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl border border-green-500/30 bg-green-500/5">
              <h3 className="text-xl font-semibold mb-3 text-green-500">✓ {t.approach1Title}</h3>
              <p className="text-muted-foreground">{t.approach1Desc}</p>
            </div>
            <div className="p-6 rounded-xl border border-green-500/30 bg-green-500/5">
              <h3 className="text-xl font-semibold mb-3 text-green-500">✓ {t.approach2Title}</h3>
              <p className="text-muted-foreground">{t.approach2Desc}</p>
            </div>
            <div className="p-6 rounded-xl border border-green-500/30 bg-green-500/5">
              <h3 className="text-xl font-semibold mb-3 text-green-500">✓ {t.approach3Title}</h3>
              <p className="text-muted-foreground">{t.approach3Desc}</p>
            </div>
            <div className="p-6 rounded-xl border border-green-500/30 bg-green-500/5">
              <h3 className="text-xl font-semibold mb-3 text-green-500">✓ {t.approach4Title}</h3>
              <p className="text-muted-foreground">{t.approach4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">{t.ctaTitle}</h2>
          <p className="text-lg text-muted-foreground mb-8">{t.ctaDesc}</p>
          <AppStoreButton lang={lang} />
        </div>
      </section>
    </FeaturePageLayout>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MentalWellnessLayout({ lang, t }: { lang: Language; t: any }) {
  return (
    <FeaturePageLayout lang={lang}>
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t.heroTitle}</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">{t.heroDesc}</p>
          <AppStoreButton lang={lang} />
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Important:</strong> {t.notice}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-8">{t.benefitsTitle}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">{t.benefit1Title}</h3>
              <p className="text-muted-foreground">{t.benefit1Desc}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">{t.benefit2Title}</h3>
              <p className="text-muted-foreground">{t.benefit2Desc}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">{t.benefit3Title}</h3>
              <p className="text-muted-foreground">{t.benefit3Desc}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">{t.benefit4Title}</h3>
              <p className="text-muted-foreground">{t.benefit4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-8">{t.whyTitle}</h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t.why1Title}</h3>
                <p className="text-muted-foreground">{t.why1Desc}</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t.why2Title}</h3>
                <p className="text-muted-foreground">{t.why2Desc}</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Palette className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t.why3Title}</h3>
                <p className="text-muted-foreground">{t.why3Desc}</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t.why4Title}</h3>
                <p className="text-muted-foreground">{t.why4Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">{t.ctaTitle}</h2>
          <p className="text-lg text-muted-foreground mb-8">{t.ctaDesc}</p>
          <AppStoreButton lang={lang} />
        </div>
      </section>
    </FeaturePageLayout>
  );
}
