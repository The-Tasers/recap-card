export type Mood = 'great' | 'good' | 'okay' | 'low' | 'rough';

// App color themes
export type ColorTheme =
  | 'midnight'
  | 'ocean'
  | 'ember'
  | 'linen'
  | 'sage'
  | 'rose';

export const COLOR_THEMES: {
  value: ColorTheme;
  label: string;
  description: string;
  preview: { bg: string; card: string; accent: string };
  isDark: boolean;
}[] = [
  {
    value: 'midnight',
    label: 'Midnight',
    description: 'Deep violet dark',
    preview: { bg: '#1f1d2b', card: '#2a2839', accent: '#8b7cf5' },
    isDark: true,
  },
  {
    value: 'ocean',
    label: 'Ocean',
    description: 'Calming teal depths',
    preview: { bg: '#1a2e38', card: '#243d4a', accent: '#5eb8b0' },
    isDark: true,
  },
  {
    value: 'ember',
    label: 'Ember',
    description: 'Warm charcoal',
    preview: { bg: '#1f1a18', card: '#2a2320', accent: '#e8a87c' },
    isDark: true,
  },
  {
    value: 'linen',
    label: 'Linen',
    description: 'Warm, creamy light',
    preview: { bg: '#f7f5f0', card: '#fdfcfa', accent: '#c4a484' },
    isDark: false,
  },
  {
    value: 'sage',
    label: 'Sage',
    description: 'Fresh mint light',
    preview: { bg: '#f2f7f4', card: '#fafcfb', accent: '#6b9e8a' },
    isDark: false,
  },
  {
    value: 'rose',
    label: 'Rose',
    description: 'Soft blush pink',
    preview: { bg: '#faf5f7', card: '#fefcfd', accent: '#d4a5b5' },
    isDark: false,
  },
];

// Block types for modular card content
export type BlockType = 'text' | 'number' | 'multiselect';

export type BlockId =
  | 'sleep'
  | 'weather'
  | 'meals'
  | 'selfcare'
  | 'health'
  | 'exercise'
  | 'social'
  | 'productivity'
  | 'hobbies';

export interface CardBlock {
  id: string;
  type: BlockType;
  blockId: BlockId;
  label: string;
  value: string | number | string[]; // string[] for multiselect
  order: number;
  icon?: string;
}

export interface DailyCard {
  id: string;
  text: string;
  mood: Mood;
  photoUrl?: string;
  createdAt: string;
  blocks?: CardBlock[];
}

// Predefined block definitions
export const BLOCK_DEFINITIONS: Record<
  BlockId,
  { type: BlockType; label: string }
> = {
  sleep: {
    type: 'number',
    label: 'Hours slept',
  },
  weather: {
    type: 'multiselect',
    label: 'Weather outside',
  },
  meals: {
    type: 'multiselect',
    label: 'Meals eaten',
  },
  selfcare: {
    type: 'multiselect',
    label: 'Daily hygiene',
  },
  health: {
    type: 'multiselect',
    label: 'Health events',
  },
  exercise: {
    type: 'multiselect',
    label: 'Workout done',
  },
  social: {
    type: 'multiselect',
    label: 'Social time',
  },
  productivity: {
    type: 'multiselect',
    label: 'Productive tasks',
  },
  hobbies: {
    type: 'multiselect',
    label: 'Hobbies enjoyed',
  },
};

// Block options definitions
export const WEATHER_OPTIONS = [
  { value: 'sunny', label: 'sunny' },
  { value: 'partly-cloudy', label: 'partly cloudy' },
  { value: 'cloudy', label: 'cloudy' },
  { value: 'rainy', label: 'rainy' },
  { value: 'stormy', label: 'stormy' },
  { value: 'snowy', label: 'snowy' },
  { value: 'foggy', label: 'foggy' },
  { value: 'windy', label: 'windy' },
];

export const MEAL_OPTIONS = [
  { value: 'breakfast', label: 'breakfast' },
  { value: 'lunch', label: 'lunch' },
  { value: 'dinner', label: 'dinner' },
  { value: 'night-snack', label: 'night snack' },
];

export const SELFCARE_OPTIONS = [
  { value: 'shower', label: 'shower' },
  { value: 'brush-teeth', label: 'brush teeth' },
  { value: 'wash-face', label: 'wash face' },
  { value: 'drink-water', label: 'drink water' },
];

export const HEALTH_OPTIONS = [
  { value: 'sick', label: 'sick' },
  { value: 'hospital', label: 'hospital' },
  { value: 'checkup', label: 'checkup' },
  { value: 'medicine', label: 'medicine' },
];

export const EXERCISE_OPTIONS = [
  { value: 'running', label: 'running' },
  { value: 'walking', label: 'walking' },
  { value: 'cycling', label: 'cycling' },
  { value: 'swimming', label: 'swimming' },
  { value: 'gym', label: 'gym' },
  { value: 'yoga', label: 'yoga' },
  { value: 'stretching', label: 'stretching' },
  { value: 'hiking', label: 'hiking' },
  { value: 'dancing', label: 'dancing' },
  { value: 'sports', label: 'sports' },
];

export const SOCIAL_OPTIONS = [
  { value: 'family', label: 'family time' },
  { value: 'friends', label: 'friends' },
  { value: 'date', label: 'date' },
  { value: 'call', label: 'phone call' },
  { value: 'texting', label: 'texting' },
  { value: 'videocall', label: 'video call' },
  { value: 'party', label: 'party' },
  { value: 'alone', label: 'alone time' },
];

export const PRODUCTIVITY_OPTIONS = [
  { value: 'work', label: 'work' },
  { value: 'study', label: 'study' },
  { value: 'writing', label: 'writing' },
  { value: 'tasks', label: 'tasks done' },
  { value: 'goals', label: 'goal progress' },
  { value: 'coding', label: 'coding' },
  { value: 'meeting', label: 'meetings' },
  { value: 'focused', label: 'deep focus' },
];

export const HOBBIES_OPTIONS = [
  { value: 'gaming', label: 'gaming' },
  { value: 'art', label: 'art' },
  { value: 'photography', label: 'photography' },
  { value: 'music', label: 'music' },
  { value: 'reading', label: 'reading' },
  { value: 'movies', label: 'movies/TV' },
  { value: 'cooking', label: 'cooking' },
  { value: 'outdoors', label: 'outdoors' },
];

export const MOODS: {
  value: Mood;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}[] = [
  { value: 'great', label: 'Great', emoji: '😄', color: '#22c55e', bgColor: '#16593420' },
  { value: 'good', label: 'Good', emoji: '🙂', color: '#84cc16', bgColor: '#3f621220' },
  { value: 'okay', label: 'Okay', emoji: '😐', color: '#eab308', bgColor: '#a1620720' },
  { value: 'low', label: 'Low', emoji: '😔', color: '#f97316', bgColor: '#c2410c20' },
  { value: 'rough', label: 'Rough', emoji: '😢', color: '#ef4444', bgColor: '#b91c1c20' },
];

export const getMoodInfo = (mood: Mood) => {
  return MOODS.find((m) => m.value === mood) || MOODS[2];
};

// Question categories
export type QuestionCategory =
  | 'reflection'
  | 'gratitude'
  | 'work'
  | 'creativity'
  | 'random';
