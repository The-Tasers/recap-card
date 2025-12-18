import { DailyCard } from '@/lib/types';

// Format date nicely
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// Format relative date for stream
export function formatRelativeDate(date: Date): string {
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

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  if (diffDays < 14) {
    return `Last ${date.toLocaleDateString('en-US', { weekday: 'long' })}`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Group cards by week
export function groupCardsByWeek(
  cards: DailyCard[]
): { label: string; cards: DailyCard[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const groups: { label: string; cards: DailyCard[] }[] = [];
  let currentGroup: { label: string; cards: DailyCard[] } | null = null;

  // Sort cards by date descending
  const sortedCards = [...cards].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  sortedCards.forEach((card) => {
    const cardDate = new Date(card.createdAt);
    const diffDays = Math.floor(
      (today.getTime() -
        new Date(
          cardDate.getFullYear(),
          cardDate.getMonth(),
          cardDate.getDate()
        ).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    let label: string;
    if (diffDays < 7) {
      label = 'This week';
    } else if (diffDays < 14) {
      label = 'Last week';
    } else {
      // Group by month
      label = cardDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    }

    if (!currentGroup || currentGroup.label !== label) {
      currentGroup = { label, cards: [] };
      groups.push(currentGroup);
    }
    currentGroup.cards.push(card);
  });

  return groups;
}
