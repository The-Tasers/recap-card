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
    feature: string;
  }>;
}

// Generate all static params for /features/[feature] (English)
export async function generateStaticParams() {
  return FEATURE_SLUGS.map((feature) => ({ feature }));
}

// Generate metadata dynamically from JSON translations
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { feature } = await params;

  // Validate feature
  const validFeature = FEATURE_SLUGS.includes(feature as FeatureSlug) ? (feature as FeatureSlug) : undefined;

  if (!validFeature) {
    return {};
  }

  const lang: Language = 'en';
  const featureType = FEATURE_SLUG_TO_TYPE[validFeature];
  const t = getFeatureTranslation(lang, featureType);
  const meta = t.meta;

  const baseUrl = 'https://recapz.app';
  const url = `${baseUrl}/features/${feature}`;

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

function getFeatureDisplayName(feature: FeatureType): string {
  const names: Record<FeatureType, string> = {
    moodTracking: 'Mood Tracking',
    dailyReflection: 'Daily Reflection',
    mentalWellness: 'Mental Wellness',
  };
  return names[feature];
}

export default async function FeaturePage({ params }: PageProps) {
  const { feature } = await params;

  // Validate feature
  const validFeature = FEATURE_SLUGS.includes(feature as FeatureSlug) ? (feature as FeatureSlug) : undefined;

  if (!validFeature) {
    notFound();
  }

  const featureType = FEATURE_SLUG_TO_TYPE[validFeature];

  return <FeaturePageContent lang="en" feature={featureType} />;
}
