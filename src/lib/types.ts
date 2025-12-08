export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

// Block types for modular card content
export type BlockType = 'text' | 'number' | 'link' | 'slider';

export type BlockId =
  | 'hardMoment'
  | 'learned'
  | 'unexpected'
  | 'soundtrack'
  | 'steps'
  | 'sleep'
  | 'oneLine'
  | 'gratitude'
  | 'weather'
  | 'highlight'
  | 'custom';

export interface CardBlock {
  id: string;
  type: BlockType;
  blockId: BlockId;
  label: string;
  value: string | number;
  order: number;
  icon?: string;
}

// Template types
export type TemplateId =
  | 'default'
  | 'photoHeader'
  | 'ultraMinimal'
  | 'mixedGrid';

// Theme types
export type ThemeId = 'sunrise' | 'ocean' | 'sunset' | 'forest' | 'lavender';
export type FontPreset = 'system' | 'serif' | 'mono' | 'rounded';

// Question categories
export type QuestionCategory =
  | 'reflection'
  | 'gratitude'
  | 'work'
  | 'creativity'
  | 'random';

export interface DailyCard {
  id: string;
  text: string;
  mood: Mood;
  photoUrl?: string;
  createdAt: string;

  // New optional fields
  blocks?: CardBlock[];
  template?: TemplateId;
  theme?: ThemeId;
  font?: FontPreset;
  darkMode?: boolean;
  tags?: string[];

  // Share settings
  shareId?: string;
  shareExpiresAt?: string;
}

// Predefined block definitions
export const BLOCK_DEFINITIONS: Record<
  BlockId,
  { type: BlockType; label: string; placeholder: string; icon: string }
> = {
  hardMoment: {
    type: 'text',
    label: 'What made today hard',
    placeholder: 'Describe a challenge...',
    icon: '💪',
  },
  learned: {
    type: 'text',
    label: 'What I learned today',
    placeholder: 'Something new I discovered...',
    icon: '💡',
  },
  unexpected: {
    type: 'text',
    label: 'Unexpected moment',
    placeholder: 'Something surprising...',
    icon: '✨',
  },
  soundtrack: {
    type: 'link',
    label: "Today's soundtrack",
    placeholder: 'Song name or Spotify link...',
    icon: '🎵',
  },
  steps: {
    type: 'number',
    label: 'Steps walked',
    placeholder: '0',
    icon: '👟',
  },
  sleep: { type: 'number', label: 'Sleep hours', placeholder: '0', icon: '😴' },
  oneLine: {
    type: 'text',
    label: 'One line memory',
    placeholder: 'A brief memory...',
    icon: '📝',
  },
  gratitude: {
    type: 'text',
    label: 'Gratitude item',
    placeholder: "Something I'm grateful for...",
    icon: '🙏',
  },
  weather: {
    type: 'text',
    label: 'Weather',
    placeholder: 'Sunny, Rainy...',
    icon: '🌤️',
  },
  highlight: {
    type: 'text',
    label: 'Highlight',
    placeholder: 'Best part of the day...',
    icon: '⭐',
  },
  custom: {
    type: 'text',
    label: 'Custom note',
    placeholder: 'Write anything...',
    icon: '📌',
  },
};

// Template definitions
export const TEMPLATES: Record<
  TemplateId,
  { name: string; description: string }
> = {
  default: { name: 'Classic', description: 'Standard card layout' },
  photoHeader: {
    name: 'Photo Header',
    description: 'Large photo with two columns below',
  },
  ultraMinimal: {
    name: 'Ultra Minimal',
    description: 'Text-only, clean design',
  },
  mixedGrid: {
    name: 'Mixed Grid',
    description: 'Photo + metrics + notes in grid',
  },
};

// Theme definitions
export const THEMES: Record<ThemeId, { name: string; gradient: string }> = {
  sunrise: {
    name: 'Sunrise',
    gradient: 'from-amber-50/80 via-white to-violet-50/80',
  },
  ocean: { name: 'Ocean', gradient: 'from-cyan-50/80 via-white to-blue-50/80' },
  sunset: {
    name: 'Sunset',
    gradient: 'from-orange-50/80 via-white to-pink-50/80',
  },
  forest: {
    name: 'Forest',
    gradient: 'from-green-50/80 via-white to-emerald-50/80',
  },
  lavender: {
    name: 'Lavender',
    gradient: 'from-purple-50/80 via-white to-indigo-50/80',
  },
};

// Font presets
export const FONT_PRESETS: Record<
  FontPreset,
  { name: string; className: string }
> = {
  system: { name: 'Sans', className: 'font-sans' },
  serif: { name: 'Serif', className: 'font-serif' },
  mono: { name: 'Mono', className: 'font-mono' },
  rounded: { name: 'Rounded', className: 'font-sans' }, // Would need custom font
};

export const MOODS: {
  value: Mood;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { value: 'great', label: 'Great', emoji: '😄', color: 'bg-green-500' },
  { value: 'good', label: 'Good', emoji: '🙂', color: 'bg-lime-500' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'bg-yellow-500' },
  { value: 'bad', label: 'Bad', emoji: '😔', color: 'bg-orange-500' },
  { value: 'terrible', label: 'Terrible', emoji: '😢', color: 'bg-red-500' },
];

export const getMoodInfo = (mood: Mood) => {
  return MOODS.find((m) => m.value === mood) || MOODS[2];
};
