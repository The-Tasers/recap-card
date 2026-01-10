import { Language } from '@/lib/i18n/translations';

const LOCALES: Record<Language, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
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
  es: {
    today: 'Hoy',
    yesterday: 'Ayer',
    lastPrefix: 'El pasado',
    thisWeek: 'Esta semana',
    lastWeek: 'Semana pasada',
  },
  fr: {
    today: 'Aujourd\'hui',
    yesterday: 'Hier',
    lastPrefix: 'Dernier',
    thisWeek: 'Cette semaine',
    lastWeek: 'Semaine dernière',
  },
  de: {
    today: 'Heute',
    yesterday: 'Gestern',
    lastPrefix: 'Letzten',
    thisWeek: 'Diese Woche',
    lastWeek: 'Letzte Woche',
  },
  zh: {
    today: '今天',
    yesterday: '昨天',
    lastPrefix: '上',
    thisWeek: '本周',
    lastWeek: '上周',
  },
  ja: {
    today: '今日',
    yesterday: '昨日',
    lastPrefix: '先',
    thisWeek: '今週',
    lastWeek: '先週',
  },
  ko: {
    today: '오늘',
    yesterday: '어제',
    lastPrefix: '지난',
    thisWeek: '이번 주',
    lastWeek: '지난 주',
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
    // Handle "Last [weekday]" in different languages
    switch (language) {
      case 'ru':
        return `Прошл. ${weekday.toLowerCase()}`;
      case 'zh':
      case 'ja':
      case 'ko':
        return `${labels.lastPrefix}${weekday}`;
      default:
        return `${labels.lastPrefix} ${weekday}`;
    }
  }
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

