import { DailyCard } from './types';

// Daily reflection questions
const DAILY_QUESTIONS = [
  'What stood out today?',
  'What made you feel something today?',
  'What challenged you today?',
  'What gave you energy today?',
  'What moment is worth remembering?',
  'What did you learn about yourself today?',
  'What are you grateful for today?',
  'What surprised you today?',
  'What made you smile today?',
  'What would you do differently?',
];

// Get today's question (deterministic based on date)
export function getDailyQuestion(): string {
  const today = new Date();
  const dateString = today.toDateString();

  // Check if we're on the client
  if (typeof window !== 'undefined') {
    // Check localStorage first for consistency
    const stored = localStorage.getItem('daily-question');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.date === dateString) {
          return parsed.question;
        }
      } catch {
        // Invalid stored data, continue to generate new
      }
    }
  }

  // Generate deterministic index based on date
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const seed = year * 10000 + month * 100 + day;
  const index = seed % DAILY_QUESTIONS.length;
  const question = DAILY_QUESTIONS[index];

  // Store for consistency throughout the day (client-side only)
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      'daily-question',
      JSON.stringify({ date: dateString, question })
    );
  }

  return question;
}

// Check if a recap exists for today
export function getTodayRecap(cards: DailyCard[]): DailyCard | undefined {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toDateString();

  return cards.find((card) => {
    const cardDate = new Date(card.createdAt);
    return cardDate.toDateString() === todayString;
  });
}

// Get time-based greeting with username
export function getGreeting(userName: string): string {
  const hour = new Date().getHours();

  if (!userName) {
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  if (hour >= 5 && hour < 12) return `Good morning, ${userName}`;
  if (hour >= 12 && hour < 17) return `Good afternoon, ${userName}`;
  return `Good evening, ${userName}`;
}

// Format today's date
export function getTodayDateFormatted(): string {
  const today = new Date();
  return today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Get last 7 days of mood data (including today)
export function getLast7DaysMoodData(cards: DailyCard[]): (number | null)[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const moodData: (number | null)[] = [];

  // Loop through last 7 days (from 6 days ago to today)
  for (let i = 6; i >= 0; i--) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateString = checkDate.toDateString();

    // Find card for this date
    const card = cards.find((c) => {
      const cardDate = new Date(c.createdAt);
      return cardDate.toDateString() === dateString;
    });

    // Convert mood to number or null
    if (card && card.mood) {
      // Map mood strings to numbers
      const moodMap: Record<string, number> = {
        terrible: 1,
        bad: 2,
        neutral: 3,
        good: 4,
        great: 5,
      };
      moodData.push(moodMap[card.mood] || null);
    } else {
      moodData.push(null);
    }
  }

  return moodData;
}
