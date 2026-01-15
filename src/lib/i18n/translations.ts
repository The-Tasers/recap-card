export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'ru';

export const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
];

import en from './locales/en.json';
import ru from './locales/ru.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

// Merge with English as fallback for missing keys
type Translations = typeof en;
const withFallback = (locale: Partial<Translations>): Translations => ({
  ...en,
  ...locale,
  features: { ...en.features, ...(locale.features || {}) },
});

export const translations: Record<Language, Translations> = {
  en,
  ru: withFallback(ru),
  es: withFallback(es),
  fr: withFallback(fr),
  de: withFallback(de),
  zh: withFallback(zh),
  ja: withFallback(ja),
  ko: withFallback(ko),
};

export type TranslationKey = keyof typeof en;
