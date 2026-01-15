import { translations, type Language } from '../translations';

export type FeatureType = 'moodTracking' | 'dailyReflection' | 'mentalWellness';

export const FEATURE_SLUGS = ['mood-tracking', 'daily-reflection', 'mental-wellness'] as const;
export type FeatureSlug = (typeof FEATURE_SLUGS)[number];

export const FEATURE_SLUG_TO_TYPE: Record<FeatureSlug, FeatureType> = {
  'mood-tracking': 'moodTracking',
  'daily-reflection': 'dailyReflection',
  'mental-wellness': 'mentalWellness',
};

export function getFeatureTranslation(lang: Language, feature: FeatureType) {
  return translations[lang]?.features?.[feature] || translations.en.features[feature];
}

export function getFeatureMetadata(lang: Language, feature: FeatureType) {
  const t = getFeatureTranslation(lang, feature);
  return t.meta;
}
