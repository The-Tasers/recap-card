'use client';

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useSettingsStore } from '@/lib/store';
import {
  translations,
  type Language,
  type TranslationKey,
  LANGUAGES,
} from './translations';

export { LANGUAGES, type Language, type TranslationKey };

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// Pluralization rules for different languages
function getPlural(count: number, language: Language): string {
  if (language === 'ru') {
    // Russian pluralization rules
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
      return 'one';
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return 'few';
    }
    return 'other';
  }

  // English and default
  return count === 1 ? 'one' : 'other';
}

// Parse ICU-like plural format: {count, plural, one {day} few {дня} other {days}}
function parsePlural(
  template: string,
  params: Record<string, string | number>,
  language: Language
): string {
  // Match the entire plural block including nested braces
  const pluralRegex = /\{(\w+), plural, ((?:[^{}]|\{[^{}]*\})+)\}/g;

  return template.replace(
    pluralRegex,
    (match, varName, pluralOptions) => {
      const count = params[varName];
      if (typeof count !== 'number') return match;

      const pluralForm = getPlural(count, language);

      // Parse plural options like "one {day} few {дня} other {days}"
      const optionsRegex = /(\w+)\s*\{([^{}]*)\}/g;
      let optionMatch;
      const options: Record<string, string> = {};

      while ((optionMatch = optionsRegex.exec(pluralOptions)) !== null) {
        options[optionMatch[1]] = optionMatch[2];
      }

      return options[pluralForm] || options['other'] || '';
    }
  );
}

// Interpolate variables like {count}, {name}
function interpolate(
  template: string,
  params: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { language, setLanguage } = useSettingsStore();

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const template = translations[language]?.[key] || translations.en[key] || key;

      if (!params) return template;

      // First handle pluralization
      let result = parsePlural(template, params, language);
      // Then handle simple interpolation
      result = interpolate(result, params);

      return result;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// Hook for getting translated option labels (for blocks)
export function useTranslatedOptions() {
  const { t } = useI18n();

  const getOptionLabel = useCallback(
    (blockId: string, value: string): string => {
      const key = `${blockId}.${value}` as TranslationKey;
      const translated = t(key);
      // If translation not found (key returned), return original value
      return translated === key ? value : translated;
    },
    [t]
  );

  const getBlockLabel = useCallback(
    (blockId: string): string => {
      const key = `block.${blockId}` as TranslationKey;
      const translated = t(key);
      return translated === key ? blockId : translated;
    },
    [t]
  );

  const getMoodLabel = useCallback(
    (mood: string): string => {
      const key = `mood.${mood}` as TranslationKey;
      const translated = t(key);
      return translated === key ? mood : translated;
    },
    [t]
  );

  return { getOptionLabel, getBlockLabel, getMoodLabel };
}
