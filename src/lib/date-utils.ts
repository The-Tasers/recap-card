import { Language } from '@/lib/i18n/translations';

const LOCALES: Record<Language, string> = {
  en: 'en-US',
  ru: 'ru-RU',
};

const DATE_LABELS: Record<Language, {
  today: string;
  yesterday: string;
  lastPrefix: string;
  thisWeek: string;
  lastWeek: string;
}> = {
  en: {
    today: 'Today',
    yesterday: 'Yesterday',
    lastPrefix: 'Last',
    thisWeek: 'This week',
    lastWeek: 'Last week',
  },
  ru: {
    today: 'Сегодня',
    yesterday: 'Вчера',
    lastPrefix: 'Прошлый',
    thisWeek: 'Эта неделя',
    lastWeek: 'Прошлая неделя',
  },
};

// Format date nicely
export function formatDate(date: Date, language: Language = 'en'): string {
  return date.toLocaleDateString(LOCALES[language], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// Format short date (e.g., "Dec 31" or "31 дек")
export function formatShortDate(date: Date, language: Language = 'en'): string {
  return date.toLocaleDateString(LOCALES[language], {
    month: 'short',
    day: 'numeric',
  });
}

// Format relative date for stream
export function formatRelativeDate(date: Date, language: Language = 'en'): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const cardDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const diffDays = Math.floor(
    (today.getTime() - cardDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const labels = DATE_LABELS[language];
  const locale = LOCALES[language];

  if (diffDays === 0) return labels.today;
  if (diffDays === 1) return labels.yesterday;
  if (diffDays < 7) {
    return date.toLocaleDateString(locale, { weekday: 'long' });
  }
  if (diffDays < 14) {
    const weekday = date.toLocaleDateString(locale, { weekday: 'long' });
    return language === 'ru' ? `Прошл. ${weekday.toLowerCase()}` : `Last ${weekday}`;
  }
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

