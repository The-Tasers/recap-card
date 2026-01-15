import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LANGUAGES, type Language } from '@/lib/i18n/translations';
import {
  FEATURE_SLUGS,
  FEATURE_SLUG_TO_TYPE,
  getFeatureTranslation,
  type FeatureSlug,
  type FeatureType,
} from '@/lib/i18n/features';
import { FeaturePageContent } from '@/components/feature-page-content';

interface PageProps {
  params: Promise<{
    lang: string;
    feature: string;
  }>;
}

// Generate all static params for [lang]/features/[feature]
export async function generateStaticParams() {
  const params: { lang: string; feature: string }[] = [];

  // Generate for all non-English languages
  for (const { value: lang } of LANGUAGES) {
    if (lang === 'en') continue; // English uses /features/[feature] route
    for (const feature of FEATURE_SLUGS) {
      params.push({ lang, feature });
    }
  }

  return params;
}

// Generate metadata dynamically from JSON translations
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, feature } = await params;

  // Validate lang and feature
  const validLang = LANGUAGES.find((l) => l.value === lang)?.value as Language | undefined;
  const validFeature = FEATURE_SLUGS.includes(feature as FeatureSlug) ? (feature as FeatureSlug) : undefined;

  if (!validLang || !validFeature) {
    return {};
  }

  const featureType = FEATURE_SLUG_TO_TYPE[validFeature];
  const t = getFeatureTranslation(validLang, featureType);
  const meta = t.meta;

  const baseUrl = 'https://recapz.app';
  const url = `${baseUrl}/${lang}/features/${feature}`;

  // Build alternate languages
  const languages: Record<string, string> = {};
  for (const { value } of LANGUAGES) {
    languages[value] = value === 'en' ? `${baseUrl}/features/${feature}` : `${baseUrl}/${value}/features/${feature}`;
  }

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      type: 'website',
      url,
      locale: getLocale(validLang),
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `RECAPZ ${getFeatureDisplayName(featureType)}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.twitterTitle,
      description: meta.twitterDescription,
    },
    alternates: {
      canonical: url,
      languages,
    },
  };
}

function getLocale(lang: Language): string {
  const locales: Record<Language, string> = {
    en: 'en_US',
    es: 'es_ES',
    fr: 'fr_FR',
    de: 'de_DE',
    zh: 'zh_CN',
    ja: 'ja_JP',
    ko: 'ko_KR',
    ru: 'ru_RU',
  };
  return locales[lang] || 'en_US';
}

function getFeatureDisplayName(feature: FeatureType): string {
  const names: Record<FeatureType, string> = {
    moodTracking: 'Mood Tracking',
    dailyReflection: 'Daily Reflection',
    mentalWellness: 'Mental Wellness',
  };
  return names[feature];
}

export default async function FeaturePage({ params }: PageProps) {
  const { lang, feature } = await params;

  // Validate lang and feature
  const validLang = LANGUAGES.find((l) => l.value === lang)?.value as Language | undefined;
  const validFeature = FEATURE_SLUGS.includes(feature as FeatureSlug) ? (feature as FeatureSlug) : undefined;

  if (!validLang || !validFeature) {
    notFound();
  }

  const featureType = FEATURE_SLUG_TO_TYPE[validFeature];

  return <FeaturePageContent lang={validLang} feature={featureType} />;
}
